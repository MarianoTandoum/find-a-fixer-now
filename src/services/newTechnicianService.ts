
import { supabase } from "@/integrations/supabase/client";

export interface NewTechnician {
  id: string;
  user_id?: string;
  name: string;
  phone: string;
  profession: string;
  city: string;
  profile_picture?: string;
  identity_document?: string;
  contract_signed: boolean;
  status: 'pending' | 'validated' | 'rejected' | 'suspended';
  rating: number;
  total_missions: number;
  bio?: string;
  is_validated: boolean;
  created_at: string;
  updated_at: string;
}

export const newTechnicianService = {
  getAllTechnicians: async (): Promise<NewTechnician[]> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching technicians:', error);
      return [];
    }

    return (data as NewTechnician[]) || [];
  },

  getTechnicianById: async (id: string): Promise<NewTechnician | null> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching technician with ID ${id}:`, error);
      return null;
    }

    return data as NewTechnician;
  },

  searchTechnicians: async (query: string): Promise<NewTechnician[]> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .or(`name.ilike.%${query}%,profession.ilike.%${query}%`)
      .eq('is_validated', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error searching technicians:', error);
      return [];
    }

    return (data as NewTechnician[]) || [];
  },

  getProfessions: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('profession')
      .eq('is_validated', true);

    if (error) {
      console.error('Error fetching professions:', error);
      return [];
    }

    const professions = new Set(data.map(tech => tech.profession));
    return Array.from(professions).sort();
  },

  addTechnician: async (technicianData: Omit<NewTechnician, 'id' | 'is_validated' | 'created_at' | 'updated_at' | 'status' | 'rating' | 'total_missions'>): Promise<NewTechnician | null> => {
    const { data, error } = await supabase
      .from('technicians')
      .insert([{ 
        ...technicianData, 
        is_validated: false,
        status: 'pending',
        rating: 0,
        total_missions: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding technician:', error);
      return null;
    }

    return data as NewTechnician;
  },

  validateTechnician: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('technicians')
      .update({ 
        is_validated: true,
        status: 'validated'
      })
      .eq('id', id);

    return !error;
  },

  deleteTechnician: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', id);

    return !error;
  }
};
