
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  client_id: string;
  technician_id: string;
  status: 'active' | 'closed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'appointment_request' | 'appointment_response';
  is_read: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  conversation_id: string;
  client_id: string;
  technician_id: string;
  proposed_date: string;
  description?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

const createConversation = async (technicianId: string): Promise<Conversation | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('conversations')
    .insert([{
      client_id: session.user.id,
      technician_id: technicianId
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return data as Conversation;
};

const getOrCreateConversation = async (technicianId: string): Promise<Conversation | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  // Chercher une conversation existante
  const { data: existing } = await supabase
    .from('conversations')
    .select('*')
    .eq('client_id', session.user.id)
    .eq('technician_id', technicianId)
    .single();

  if (existing) {
    return existing as Conversation;
  }

  // Créer une nouvelle conversation
  return await createConversation(technicianId);
};

const getUserConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  return (data as Conversation[]) || [];
};

const sendMessage = async (conversationId: string, content: string, messageType: 'text' | 'appointment_request' = 'text'): Promise<Message | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert([{
      conversation_id: conversationId,
      sender_id: session.user.id,
      content,
      message_type: messageType
    }])
    .select()
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  // Mettre à jour la date de dernière activité de la conversation
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data as Message;
};

const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data as Message[]) || [];
};

const markMessagesAsRead = async (conversationId: string): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', session.user.id);
};

const createAppointment = async (conversationId: string, technicianId: string, proposedDate: string, description?: string): Promise<Appointment | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('appointments')
    .insert([{
      conversation_id: conversationId,
      client_id: session.user.id,
      technician_id: technicianId,
      proposed_date: proposedDate,
      description
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating appointment:', error);
    return null;
  }

  return data as Appointment;
};

const updateAppointmentStatus = async (appointmentId: string, status: 'accepted' | 'declined' | 'completed' | 'cancelled'): Promise<boolean> => {
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId);

  return !error;
};

export const conversationService = {
  createConversation,
  getOrCreateConversation,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markMessagesAsRead,
  createAppointment,
  updateAppointmentStatus
};
