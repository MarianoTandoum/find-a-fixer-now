
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, disabled = false }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="flex space-x-3 items-end">
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message..."
            onKeyPress={handleKeyPress}
            className="min-h-[44px] resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-full px-4"
            disabled={disabled}
          />
        </div>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 rounded-full h-11 w-11 p-0"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
