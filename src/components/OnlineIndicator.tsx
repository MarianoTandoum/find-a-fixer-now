
import { Circle } from 'lucide-react';

interface OnlineIndicatorProps {
  isOnline: boolean;
  lastSeen?: string;
  showText?: boolean;
}

const OnlineIndicator = ({ isOnline, lastSeen, showText = false }: OnlineIndicatorProps) => {
  const getStatusText = () => {
    if (isOnline) return 'En ligne';
    
    if (!lastSeen) return 'Hors ligne';
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - lastSeenDate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Actif à l\'instant';
    if (diffMinutes < 60) return `Actif il y a ${diffMinutes} min`;
    if (diffMinutes < 1440) return `Actif il y a ${Math.floor(diffMinutes / 60)}h`;
    
    return 'Hors ligne';
  };

  return (
    <div className="flex items-center space-x-1">
      <Circle 
        className={`w-2 h-2 ${isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400 fill-gray-400'}`} 
      />
      {showText && (
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
          {getStatusText()}
        </span>
      )}
    </div>
  );
};

export default OnlineIndicator;
