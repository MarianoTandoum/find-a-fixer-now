
import { supabase } from "@/integrations/supabase/client";

export interface Technician {
  id: string;
  name: string;
  profession: string;
  phone: string;
  location?: string;
  profile_picture?: string;
  user_id: string;  // Added user_id as required property
  is_validated: boolean;
  created_at: string;
}

const getAllTechnicians = async (): Promise<Technician[]> => {
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching technicians:', error);
    return [];
  }

  // Type assertion to ensure data conforms to Technician[]
  return (data as Technician[]) || [];
};

const getTechnicianById = async (id: string): Promise<Technician | null> => {
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching technician with ID ${id}:`, error);
    return null;
  }

  // Type assertion to ensure data conforms to Technician
  return data as Technician;
};

const searchTechnicians = async (query: string): Promise<Technician[]> => {
  const { data, error } = await supabase
    .from('technicians')
    .select('*')
    .or(`name.ilike.%${query}%,profession.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching technicians:', error);
    return [];
  }

  // Type assertion to ensure data conforms to Technician[]
  return (data as Technician[]) || [];
};

const getProfessions = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('technicians')
    .select('profession')
    .is('is_validated', true);

  if (error) {
    console.error('Error fetching professions:', error);
    return [];
  }

  const professions = new Set(data.map(tech => tech.profession));
  return Array.from(professions).sort();
};

const addTechnician = async (technicianData: Omit<Technician, 'id' | 'is_validated' | 'created_at'>): Promise<Technician | null> => {
  const { data, error } = await supabase
    .from('technicians')
    .insert([{ ...technicianData, is_validated: false }])
    .select()
    .single();

  if (error) {
    console.error('Error adding technician:', error);
    return null;
  }

  // Type assertion to ensure data conforms to Technician
  return data as Technician;
};

const validateTechnician = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('technicians')
    .update({ is_validated: true })
    .eq('id', id);

  return !error;
};

const deleteTechnician = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('technicians')
    .delete()
    .eq('id', id);

  return !error;
};

export const technicianService = {
  getAllTechnicians,
  searchTechnicians,
  getProfessions,
  validateTechnician,
  deleteTechnician,
  getTechnicianById,
  addTechnician
};
