
import { Conversation } from "@/services/conversationService";
import { Technician } from "@/services/technicianService";
import { UserProfile } from "@/services/userProfileService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import OnlineIndicator from "@/components/OnlineIndicator";
import CallInterface from "@/components/CallInterface";
import { ArrowLeft } from "lucide-react";

interface ConversationHeaderProps {
  conversation: Conversation;
  technicians: Record<string, Technician>;
  userProfiles: Record<string, UserProfile>;
  currentUser: any;
  onBack: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
}

const ConversationHeader = ({
  conversation,
  technicians,
  userProfiles,
  currentUser,
  onBack,
  onStartCall
}: ConversationHeaderProps) => {
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

  const contactName = getContactName(conversation);
  const contactProfile = getContactProfile(conversation);

  return (
    <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="md:hidden"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {contactName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1">
            <OnlineIndicator 
              isOnline={contactProfile?.is_online || false}
            />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{contactName}</h3>
          <OnlineIndicator 
            isOnline={contactProfile?.is_online || false}
            lastSeen={contactProfile?.last_seen}
            showText={true}
          />
        </div>
      </div>
      
      <CallInterface
        contactName={contactName}
        contactId={conversation.client_id === currentUser.id 
          ? conversation.technician_id 
          : conversation.client_id}
        onStartCall={onStartCall}
      />
    </div>
  );
};

export default ConversationHeader;
