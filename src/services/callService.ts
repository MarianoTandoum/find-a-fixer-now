
import { supabase } from "@/integrations/supabase/client";

export interface Call {
  id: string;
  conversation_id: string;
  caller_id: string;
  callee_id: string;
  status: 'initiated' | 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
  created_at: string;
}

export const callService = {
  initiateCall: async (conversationId: string, calleeId: string): Promise<Call | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('calls')
      .insert([{
        conversation_id: conversationId,
        caller_id: session.user.id,
        callee_id: calleeId,
        status: 'initiated'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error initiating call:', error);
      return null;
    }

    return data as Call;
  },

  updateCallStatus: async (callId: string, status: Call['status'], endedAt?: string): Promise<boolean> => {
    const updateData: any = { status };
    if (endedAt) updateData.ended_at = endedAt;
    
    const { error } = await supabase
      .from('calls')
      .update(updateData)
      .eq('id', callId);

    return !error;
  },

  getConversationCalls: async (conversationId: string): Promise<Call[]> => {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching calls:', error);
      return [];
    }

    return (data as Call[]) || [];
  }
};
