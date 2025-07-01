
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: string;
  is_online: boolean;
  last_seen?: string;
  created_at: string;
  updated_at: string;
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    return await getUserProfile(user.id);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);  
    return null;
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
};

export const createUserProfile = async (profile: Omit<UserProfile, 'created_at' | 'updated_at'>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profile])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
};
