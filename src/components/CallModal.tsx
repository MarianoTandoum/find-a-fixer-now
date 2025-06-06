
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Phone, PhoneOff, Mic, MicOff, Volume2 } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-white">
            {isIncoming ? '📞 Appel entrant' : '📞 Appel en cours'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-8 py-8">
          {/* Avatar avec animation */}
          <div className="relative">
            <Avatar className="w-32 h-32 border-4 border-white/20">
              <AvatarFallback className="text-4xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
                {contactName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {state.isCallActive && (
              <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse" />
            )}
          </div>
          
          {/* Informations de l'appel */}
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">{contactName}</h3>
            <p className="text-lg text-gray-300">{callStatus}</p>
            {state.isConnected && callDuration > 0 && (
              <p className="text-2xl font-mono text-green-400 font-bold">
                {formatDuration(callDuration)}
              </p>
            )}
          </div>

          {/* Indicateurs d'état */}
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            {state.isMuted && (
              <div className="flex items-center space-x-1">
                <MicOff className="w-4 h-4 text-red-400" />
                <span>Micro coupé</span>
              </div>
            )}
            {state.isConnected && (
              <div className="flex items-center space-x-1">
                <Volume2 className="w-4 h-4 text-green-400" />
                <span>Audio connecté</span>
              </div>
            )}
          </div>

          {/* Boutons d'action */}
          {isIncoming && !state.isCallActive ? (
            <div className="flex space-x-6">
              <Button
                onClick={handleDecline}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700 border-2 border-red-500"
              >
                <PhoneOff className="w-8 h-8" />
              </Button>
              <Button
                onClick={handleAccept}
                className="rounded-full w-16 h-16 bg-green-600 hover:bg-green-700 border-2 border-green-500"
              >
                <Phone className="w-8 h-8" />
              </Button>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Button
                onClick={toggleMute}
                variant={state.isMuted ? "destructive" : "secondary"}
                size="lg"
                className="rounded-full w-14 h-14"
              >
                {state.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </Button>
              <Button
                onClick={handleEndCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-16 h-16 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-8 h-8" />
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
