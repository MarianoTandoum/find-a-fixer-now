
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Message } from "@/services/conversationService";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderName?: string;
  showAvatar?: boolean;
}

const MessageBubble = ({ message, isOwnMessage, senderName, showAvatar = true }: MessageBubbleProps) => {
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: fr });
  };

  return (
    <div className={`flex items-end gap-2 mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      {!isOwnMessage && showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs bg-technicien-100 text-technicien-700">
            {senderName?.charAt(0)?.toUpperCase() || 'T'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-xs lg:max-w-md ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && senderName && (
          <span className="text-xs text-gray-500 mb-1 px-2">{senderName}</span>
        )}
        
        <div
          className={`px-4 py-2 rounded-2xl relative ${
            isOwnMessage
              ? 'bg-technicien-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          }`}
        >
          <p className="text-sm">{message.content}</p>
          
          <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
              {formatTime(message.created_at)}
            </span>
            
            {isOwnMessage && (
              <div className="ml-1">
                {message.is_read ? (
                  <CheckCheck className="w-3 h-3 text-blue-200" />
                ) : (
                  <Check className="w-3 h-3 text-blue-200" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {isOwnMessage && showAvatar && (
        <Avatar className="w-8 h-8">
          <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
            Moi
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
