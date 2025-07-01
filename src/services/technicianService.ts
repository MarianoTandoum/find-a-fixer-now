import { supabase } from "@/integrations/supabase/client";

export interface Technician {
  id: string;
  user_id: string;
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

export interface NewTechnician {
  user_id?: string;
  name: string;
  phone: string;
  profession: string;
  city: string;
  profile_picture?: string;
  bio?: string;
  is_validated: boolean;
}

// Fonction pour créer des techniciens de test
export const createSampleTechnicians = async () => {
  const sampleTechnicians = [
    {
      name: "Jean Dupont",
      phone: "0123456789",
      profession: "Plombier",
      city: "Paris",
      is_validated: true,
      bio: "Plombier expérimenté depuis 10 ans"
    },
    {
      name: "Marie Martin",
      phone: "0987654321", 
      profession: "Électricien",
      city: "Lyon",
      is_validated: true,
      bio: "Spécialiste en installation électrique"
    },
    {
      name: "Paul Bernard",
      phone: "0147258369",
      profession: "Mécanicien",
      city: "Marseille", 
      is_validated: true,
      bio: "Réparation automobile toutes marques"
    }
  ];

  try {
    for (const tech of sampleTechnicians) {
      const { error } = await supabase
        .from('technicians')
        .insert([tech]);
      
      if (error) {
        console.error('Error creating technician:', error);
      }
    }
    console.log('Sample technicians created successfully');
  } catch (error) {
    console.error('Error in createSampleTechnicians:', error);
  }
};

export const technicianService = {
  createTechnician: async (technician: NewTechnician): Promise<Technician | null> => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .insert([technician])
        .select()
        .single();

      if (error) {
        console.error('Error creating technician:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createTechnician:', error);
      return null;
    }
  },

  updateTechnician: async (id: string, updates: Partial<Technician>): Promise<Technician | null> => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating technician:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateTechnician:', error);
      return null;
    }
  },

  deleteTechnician: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('technicians')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting technician:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTechnician:', error);
      return false;
    }
  },
  
  getAllTechnicians: async (): Promise<Technician[]> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('is_validated', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching technicians:', error);
      return [];
    }

    return data || [];
  },

  getTechnicianById: async (id: string): Promise<Technician | null> => {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching technician:', error);
      return null;
    }

    return data;
  },

  searchTechnicians: async (profession?: string, city?: string): Promise<Technician[]> => {
    let query = supabase
      .from('technicians')
      .select('*')
      .eq('is_validated', true);

    if (profession) {
      query = query.eq('profession', profession);
    }

    if (city) {
      query = query.eq('city', city);
    }

    const { data, error } = await query.order('rating', { ascending: false });

    if (error) {
      console.error('Error searching technicians:', error);
      return [];
    }

    return data || [];
  }
};
