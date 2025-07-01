
import { Conversation } from "@/services/conversationService";
import { Technician } from "@/services/technicianService";
import { UserProfile } from "@/services/userProfileService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import OnlineIndicator from "@/components/OnlineIndicator";
import { MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  technicians: Record<string, Technician>;
  userProfiles: Record<string, UserProfile>;
  currentUser: any;
  onConversationSelect: (conversation: Conversation) => void;
}

const ConversationsList = ({
  conversations,
  selectedConversation,
  technicians,
  userProfiles,
  currentUser,
  onConversationSelect
}: ConversationsListProps) => {
  const navigate = useNavigate();

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

  if (conversations.length === 0) {
    return (
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
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => {
        const contactName = getContactName(conversation);
        const contactProfile = getContactProfile(conversation);
        
        return (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation)}
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
      })}
    </div>
  );
};

export default ConversationsList;
