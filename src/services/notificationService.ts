
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'call' | 'missed_call' | 'request' | 'payment';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

// Service temporairement désactivé - les notifications seront implémentées via les messages existants
export const notificationService = {
  createNotification: async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedId?: string
  ): Promise<Notification | null> => {
    console.log('Notification would be created:', { userId, type, title, message });
    return null;
  },

  getUserNotifications: async (): Promise<Notification[]> => {
    return [];
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    return true;
  }
};
