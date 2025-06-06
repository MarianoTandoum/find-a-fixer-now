
import { useState, useRef, useCallback } from 'react';

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isMuted: boolean;
  isCallActive: boolean;
}

export const useWebRTC = () => {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isMuted: false,
    isCallActive: false
  });

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);

  const initializePeerConnection = useCallback(() => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    };

    peerConnection.current = new RTCPeerConnection(configuration);

    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Envoyer le candidat ICE via Supabase realtime
        console.log('ICE candidate:', event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setState(prev => ({ ...prev, remoteStream }));
      if (remoteAudioRef.current) {
        remoteAudioRef.current.srcObject = remoteStream;
      }
    };

    return peerConnection.current;
  }, []);

  const startCall = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      setState(prev => ({ ...prev, localStream: stream, isCallActive: true }));

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      return offer;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }, [initializePeerConnection]);

  const answerCall = useCallback(async (offer: RTCSessionDescriptionInit) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      setState(prev => ({ ...prev, localStream: stream, isCallActive: true }));

      if (localAudioRef.current) {
        localAudioRef.current.srcObject = stream;
      }

      const pc = initializePeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      return answer;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }, [initializePeerConnection]);

  const endCall = useCallback(() => {
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    setState({
      localStream: null,
      remoteStream: null,
      isConnected: false,
      isMuted: false,
      isCallActive: false
    });
  }, [state.localStream]);

  const toggleMute = useCallback(() => {
    if (state.localStream) {
      const audioTrack = state.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = state.isMuted;
        setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
      }
    }
  }, [state.localStream, state.isMuted]);

  return {
    state,
    startCall,
    answerCall,
    endCall,
    toggleMute,
    localAudioRef,
    remoteAudioRef
  };
};
