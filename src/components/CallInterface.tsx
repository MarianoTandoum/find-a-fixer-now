
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

interface CallInterfaceProps {
  contactName: string;
  contactId: string;
  onStartCall: (type: 'audio' | 'video') => void;
  isInCall?: boolean;
  onEndCall?: () => void;
}

const CallInterface = ({ 
  contactName, 
  contactId, 
  onStartCall, 
  isInCall = false, 
  onEndCall 
}: CallInterfaceProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  if (!isInCall) {
    return (
      <div className="flex items-center space-x-2">
        <Button
          onClick={() => onStartCall('audio')}
          size="sm"
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-50"
        >
          <Phone className="w-4 h-4 mr-1" />
          Audio
        </Button>
        <Button
          onClick={() => onStartCall('video')}
          size="sm"
          variant="outline"
          className="text-blue-600 border-blue-600 hover:bg-blue-50"
        >
          <Video className="w-4 h-4 mr-1" />
          Vidéo
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center z-50">
      <div className="text-center mb-8">
        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white/20">
          <AvatarFallback className="text-4xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            {contactName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold text-white mb-2">{contactName}</h2>
        <p className="text-green-400 text-lg">En communication...</p>
      </div>

      <div className="flex items-center space-x-6">
        <Button
          onClick={() => setIsMuted(!isMuted)}
          variant={isMuted ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </Button>

        <Button
          onClick={() => setIsSpeakerOn(!isSpeakerOn)}
          variant={isSpeakerOn ? "default" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </Button>

        <Button
          onClick={() => setIsVideoOff(!isVideoOff)}
          variant={isVideoOff ? "destructive" : "secondary"}
          size="lg"
          className="rounded-full w-14 h-14"
        >
          {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </Button>

        <Button
          onClick={onEndCall}
          variant="destructive"
          size="lg"
          className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="w-8 h-8" />
        </Button>
      </div>
    </div>
  );
};

export default CallInterface;
