
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { Call } from '@/services/callService';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  call: Call | null;
  contactName: string;
  isIncoming?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}

const CallModal = ({ 
  isOpen, 
  onClose, 
  call, 
  contactName, 
  isIncoming = false,
  onAccept,
  onDecline 
}: CallModalProps) => {
  const { state, startCall, answerCall, endCall, toggleMute, localAudioRef, remoteAudioRef } = useWebRTC();
  const [callDuration, setCallDuration] = useState(0);
  const [callStatus, setCallStatus] = useState<string>('Connexion...');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (state.isConnected && state.isCallActive) {
      setCallStatus('En communication');
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else if (state.isCallActive) {
      setCallStatus(isIncoming ? 'Appel entrant...' : 'Appel en cours...');
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isConnected, state.isCallActive, isIncoming]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = async () => {
    if (onAccept) onAccept();
    try {
      await startCall();
      setCallStatus('Connecté');
    } catch (error) {
      console.error('Error accepting call:', error);
    }
  };

  const handleDecline = () => {
    if (onDecline) onDecline();
    endCall();
    onClose();
  };

  const handleEndCall = () => {
    endCall();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isIncoming ? 'Appel entrant' : 'Appel en cours'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl bg-technicien-100 text-technicien-700">
              {contactName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <h3 className="text-xl font-semibold">{contactName}</h3>
            <p className="text-gray-600 mt-1">{callStatus}</p>
            {state.isConnected && (
              <p className="text-sm text-gray-500 mt-1">{formatDuration(callDuration)}</p>
            )}
          </div>

          {isIncoming && !state.isCallActive ? (
            <div className="flex space-x-4">
              <Button
                onClick={handleDecline}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
              <Button
                onClick={handleAccept}
                className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Button
                onClick={toggleMute}
                variant={state.isMuted ? "destructive" : "outline"}
                size="lg"
                className="rounded-full w-16 h-16"
              >
                {state.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </div>
          )}
        </div>

        {/* Éléments audio cachés */}
        <audio ref={localAudioRef} autoPlay muted className="hidden" />
        <audio ref={remoteAudioRef} autoPlay className="hidden" />
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;
