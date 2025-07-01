
import { supabase } from "@/integrations/supabase/client";

export interface Conversation {
  id: string;
  client_id: string;
  technician_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Service temporairement désactivé - fonctionnalités de base pour éviter les erreurs
export const conversationService = {
  createConversation: () => Promise.resolve(null),
  getOrCreateConversation: (technicianId: string) => Promise.resolve(null),
  getUserConversations: () => Promise.resolve([] as Conversation[]),
  sendMessage: (conversationId: string, content: string) => Promise.resolve(null as Message | null),
  getConversationMessages: (conversationId: string) => Promise.resolve([] as Message[]),
  markMessagesAsRead: (conversationId: string) => Promise.resolve(),
  createAppointment: () => Promise.resolve(null),
  updateAppointmentStatus: () => Promise.resolve(false)
};
