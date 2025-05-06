
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export const getCurrentUser = async (): Promise<User | null> => {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
  return data.user;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Erreur lors de la récupération du profil utilisateur:", error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile | null> => {
  // Supprimer les champs qu'on ne veut pas mettre à jour
  const { id, created_at, updated_at, ...updateData } = profileData as any;

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Erreur lors de la mise à jour du profil utilisateur:", error);
    return null;
  }

  return data;
};
