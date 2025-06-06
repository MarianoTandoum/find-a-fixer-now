
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import { technicianService, Technician } from "@/services/technicianService";
import { getUserProfile, UserProfile } from "@/services/userProfileService";
import { callService } from "@/services/callService";
import { notificationService } from "@/services/notificationService";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MessageBubble from "@/components/MessageBubble";
import CallModal from "@/components/CallModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, Phone, ArrowLeft, Circle } from "lucide-react";
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
  const [callModal, setCallModal] = useState<{ isOpen: boolean; call: any; contactName: string }>({
    isOpen: false,
    call: null,
    contactName: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

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
        // Recharger les profils utilisateurs pour le statut en ligne
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
    
    // Charger les techniciens et profils utilisateurs
    const techIds = new Set<string>();
    const userIds = new Set<string>();
    
    convs.forEach(conv => {
      techIds.add(conv.technician_id);
      userIds.add(conv.client_id);
      userIds.add(conv.technician_id);
    });

    // Charger les techniciens
    const techData: Record<string, Technician> = {};
    for (const id of techIds) {
      const tech = await technicianService.getTechnicianById(id);
      if (tech) techData[id] = tech;
    }
    setTechnicians(techData);

    // Charger les profils utilisateurs
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
    
    // Marquer les messages comme lus
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
        
        // Créer une notification pour l'autre utilisateur
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

  const handleStartCall = async () => {
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
        setCallModal({ isOpen: true, call, contactName });
        
        // Notification pour l'autre utilisateur
        const otherUserId = selectedConversation.client_id === currentUser.id 
          ? selectedConversation.technician_id 
          : selectedConversation.client_id;
        
        await notificationService.createNotification(
          otherUserId,
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

  const getContactStatus = (conversation: Conversation) => {
    const isUserClient = conversation.client_id === currentUser?.id;
    const targetUserId = isUserClient ? conversation.technician_id : conversation.client_id;
    const profile = userProfiles[targetUserId];
    
    if (!profile) return 'hors ligne';
    
    if (profile.is_online) return 'en ligne';
    
    if (profile.last_seen) {
      const lastSeen = new Date(profile.last_seen);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
      
      if (diffMinutes < 5) return 'actif il y a quelques minutes';
      if (diffMinutes < 60) return `actif il y a ${diffMinutes} min`;
      if (diffMinutes < 1440) return `actif il y a ${Math.floor(diffMinutes / 60)}h`;
      return format(lastSeen, "dd/MM 'à' HH:mm", { locale: fr });
    }
    
    return 'hors ligne';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex">
        {/* Liste des conversations */}
        <div className={`w-full md:w-80 bg-white border-r ${selectedConversation ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>
          
          <div className="overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p>Aucune conversation</p>
                <Button
                  onClick={() => navigate("/search")}
                  className="mt-2"
                  variant="outline"
                >
                  Trouver un technicien
                </Button>
              </div>
            ) : (
              conversations.map((conversation) => {
                const contactName = getContactName(conversation);
                const contactStatus = getContactStatus(conversation);
                const isOnline = contactStatus === 'en ligne';
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback className="bg-technicien-100 text-technicien-700">
                            {contactName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <Circle
                          className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                            isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{contactName}</h3>
                        <p className="text-sm text-gray-500 truncate">{contactStatus}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* En-tête de conversation */}
              <div className="p-4 border-b bg-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="relative">
                    <Avatar>
                      <AvatarFallback className="bg-technicien-100 text-technicien-700">
                        {getContactName(selectedConversation).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Circle
                      className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${
                        getContactStatus(selectedConversation) === 'en ligne' 
                          ? 'fill-green-500 text-green-500' 
                          : 'fill-gray-400 text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{getContactName(selectedConversation)}</h3>
                    <p className="text-sm text-gray-500">{getContactStatus(selectedConversation)}</p>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartCall}
                  variant="outline"
                  size="sm"
                  className="text-technicien-600 border-technicien-600 hover:bg-technicien-50"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Appeler
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {messages.map((message) => (
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
                ))}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez votre message..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-technicien-600 hover:bg-technicien-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500">
                  Choisissez une conversation pour commencer à échanger
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Modal d'appel */}
      <CallModal
        isOpen={callModal.isOpen}
        onClose={() => setCallModal({ isOpen: false, call: null, contactName: "" })}
        call={callModal.call}
        contactName={callModal.contactName}
        onAccept={() => {
          // Logique pour accepter l'appel
        }}
        onDecline={() => {
          setCallModal({ isOpen: false, call: null, contactName: "" });
        }}
      />
    </div>
  );
};

export default Conversations;
