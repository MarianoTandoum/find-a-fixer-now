
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'call' | 'missed_call';
  title: string;
  message: string;
  is_read: boolean;
  related_id?: string;
  created_at: string;
}

export const notificationService = {
  createNotification: async (
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    relatedId?: string
  ): Promise<Notification | null> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        type,
        title,
        message,
        related_id: relatedId
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data as Notification;
  },

  getUserNotifications: async (): Promise<Notification[]> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data as Notification[]) || [];
  },

  markAsRead: async (notificationId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return !error;
  }
};
