
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
import ConversationsList from "@/components/ConversationsList";
import ConversationHeader from "@/components/ConversationHeader";
import MessageInput from "@/components/MessageInput";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle } from "lucide-react";

const Conversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !content.trim()) return;

    setSending(true);
    try {
      const message = await conversationService.sendMessage(selectedConversation.id, content);
      if (message) {
        setMessages(prev => [...prev, message]);
        
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
        {/* Liste des conversations */}
        <div className={`w-full md:w-80 bg-white border-r border-gray-200 ${selectedConversation ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
              Messages
            </h2>
          </div>
          
          <ConversationsList
            conversations={conversations}
            selectedConversation={selectedConversation}
            technicians={technicians}
            userProfiles={userProfiles}
            currentUser={currentUser}
            onConversationSelect={handleConversationSelect}
          />
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedConversation ? (
            <>
              <ConversationHeader
                conversation={selectedConversation}
                technicians={technicians}
                userProfiles={userProfiles}
                currentUser={currentUser}
                onBack={() => setSelectedConversation(null)}
                onStartCall={handleStartCall}
              />

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

              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={sending}
              />
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
