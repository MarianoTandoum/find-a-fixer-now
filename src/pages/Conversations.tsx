import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import { technicianService, Technician } from "@/services/technicianService";
import { getUserProfile, UserProfile } from "@/services/userProfileService";
import { callService } from "@/services/callService";
import { notificationService } from "@/services/notificationService";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessageBubble from "@/components/MessageBubble";
import CallInterface from "@/components/CallInterface";
import OnlineIndicator from "@/components/OnlineIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, ArrowLeft, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Conversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [technicians, setTechnicians] = useState<Record<string, Technician>>({});
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [callState, setCallState] = useState<{
    isInCall: boolean;
    contactName: string;
    contactId: string;
  }>({
    isInCall: false,
    contactName: "",
    contactId: ""
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUser(session.user);
      loadConversations();
    };

    checkAuth();
  }, [navigate]);

  // Écouter les changements en temps réel
  useEffect(() => {
    const channel = supabase
      .channel('conversations-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, () => {
        loadConversations();
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMessage = payload.new as Message;
        if (selectedConversation && newMessage.conversation_id === selectedConversation.id) {
          setMessages(prev => [...prev, newMessage]);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_profiles'
      }, () => {
        loadUserProfiles();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  const loadConversations = async () => {
    const convs = await conversationService.getUserConversations();
    setConversations(convs);
    
    const techIds = new Set<string>();
    const userIds = new Set<string>();
    
    convs.forEach(conv => {
      techIds.add(conv.technician_id);
      userIds.add(conv.client_id);
      userIds.add(conv.technician_id);
    });

    const techData: Record<string, Technician> = {};
    for (const id of techIds) {
      const tech = await technicianService.getTechnicianById(id);
      if (tech) techData[id] = tech;
    }
    setTechnicians(techData);

    await loadUserProfiles(Array.from(userIds));
    setLoading(false);
  };

  const loadUserProfiles = async (userIds?: string[]) => {
    if (!userIds) {
      userIds = Array.from(new Set([
        ...conversations.map(c => c.client_id),
        ...conversations.map(c => c.technician_id)
      ]));
    }

    const profilesData: Record<string, UserProfile> = {};
    for (const id of userIds) {
      const profile = await getUserProfile(id);
      if (profile) profilesData[id] = profile;
    }
    setUserProfiles(profilesData);
  };

  const loadMessages = async (conversation: Conversation) => {
    const msgs = await conversationService.getConversationMessages(conversation.id);
    setMessages(msgs);
    await conversationService.markMessagesAsRead(conversation.id);
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation);
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    setSending(true);
    try {
      const message = await conversationService.sendMessage(selectedConversation.id, newMessage);
      if (message) {
        setMessages(prev => [...prev, message]);
        setNewMessage("");
        
        const otherUserId = selectedConversation.client_id === currentUser.id 
          ? selectedConversation.technician_id 
          : selectedConversation.client_id;
        
        await notificationService.createNotification(
          otherUserId,
          'message',
          'Nouveau message',
          `Vous avez reçu un nouveau message`,
          message.id
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleStartCall = async (type: 'audio' | 'video') => {
    if (!selectedConversation) return;

    try {
      const call = await callService.initiateCall(
        selectedConversation.id,
        selectedConversation.client_id === currentUser.id 
          ? selectedConversation.technician_id 
          : selectedConversation.client_id
      );

      if (call) {
        const contactName = getContactName(selectedConversation);
        const contactId = selectedConversation.client_id === currentUser.id 
          ? selectedConversation.technician_id 
          : selectedConversation.client_id;
        
        setCallState({
          isInCall: true,
          contactName,
          contactId
        });
        
        await notificationService.createNotification(
          contactId,
          'call',
          'Appel entrant',
          `${currentUser.user_metadata?.first_name || 'Un utilisateur'} vous appelle`,
          call.id
        );
      }
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'appel.",
        variant: "destructive"
      });
    }
  };

  const handleEndCall = () => {
    setCallState({
      isInCall: false,
      contactName: "",
      contactId: ""
    });
  };

  const getContactName = (conversation: Conversation) => {
    const isUserClient = conversation.client_id === currentUser?.id;
    if (isUserClient) {
      const tech = technicians[conversation.technician_id];
      return tech?.name || 'Technicien';
    } else {
      const profile = userProfiles[conversation.client_id];
      return profile ? `${profile.first_name} ${profile.last_name}`.trim() || 'Client' : 'Client';
    }
  };

  const getContactProfile = (conversation: Conversation) => {
    const isUserClient = conversation.client_id === currentUser?.id;
    const targetUserId = isUserClient ? conversation.technician_id : conversation.client_id;
    return userProfiles[targetUserId];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-500">Chargement des conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (callState.isInCall) {
    return (
      <CallInterface
        contactName={callState.contactName}
        contactId={callState.contactId}
        onStartCall={handleStartCall}
        isInCall={true}
        onEndCall={handleEndCall}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Liste des conversations - Style Messenger */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Messages
            </h2>
          </div>
          
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune conversation</h3>
                <p className="text-gray-500 mb-4">Commencez par chercher un technicien</p>
                <Button
                  onClick={() => navigate("/search")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Trouver un technicien
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => {
                const contactName = getContactName(conversation);
                const contactProfile = getContactProfile(conversation);
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative flex-shrink-0">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                            {contactName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1">
                          <OnlineIndicator 
                            isOnline={contactProfile?.is_online || false} 
                            lastSeen={contactProfile?.last_seen} 
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{contactName}</h3>
                        <OnlineIndicator 
                          isOnline={contactProfile?.is_online || false} 
                          lastSeen={contactProfile?.last_seen}
                          showText={true}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de conversation - Style Messenger */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              {/* En-tête de conversation */}
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                        {getContactName(selectedConversation).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      <OnlineIndicator 
                        isOnline={getContactProfile(selectedConversation)?.is_online || false}
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{getContactName(selectedConversation)}</h3>
                    <OnlineIndicator 
                      isOnline={getContactProfile(selectedConversation)?.is_online || false}
                      lastSeen={getContactProfile(selectedConversation)?.last_seen}
                      showText={true}
                    />
                  </div>
                </div>
                
                <CallInterface
                  contactName={getContactName(selectedConversation)}
                  contactId={selectedConversation.client_id === currentUser.id 
                    ? selectedConversation.technician_id 
                    : selectedConversation.client_id}
                  onStartCall={handleStartCall}
                />
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-blue-50/30 to-white">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Aucun message pour le moment</p>
                      <p className="text-sm text-gray-400">Envoyez le premier message !</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwnMessage={message.sender_id === currentUser?.id}
                      senderName={
                        message.sender_id === currentUser?.id 
                          ? undefined 
                          : getContactName(selectedConversation)
                      }
                    />
                  ))
                )}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex space-x-3 items-end">
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="min-h-[44px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full px-4"
                      disabled={sending}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 hover:bg-blue-700 rounded-full h-11 w-11 p-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-blue-50/30 to-white">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Vos messages FixHub
                </h3>
                <p className="text-gray-500 mb-6">
                  Sélectionnez une conversation pour commencer à échanger avec vos techniciens ou clients
                </p>
                {conversations.length === 0 && (
                  <Button
                    onClick={() => navigate("/search")}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Trouver un technicien
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Conversations;
