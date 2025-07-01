
import { supabase } from "@/integrations/supabase/client";

export interface Call {
  id: string;
  conversation_id: string;
  caller_id: string;
  receiver_id: string;
  status: 'pending' | 'active' | 'ended';
  created_at: string;
}

// Service temporairement désactivé - fonctionnalités de base pour éviter les erreurs
export const callService = {
  initiateCall: (conversationId: string, receiverId: string) => Promise.resolve(null as Call | null),
  updateCallStatus: (callId: string, status: string) => Promise.resolve(false),
  getConversationCalls: (conversationId: string) => Promise.resolve([] as Call[])
};
