
import { supabase } from "@/integrations/supabase/client";

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export const adminService = {
  // Vérifier si l'utilisateur connecté est admin
  isAdmin: async (): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // Pour simplifier, on considère que l'admin a un email spécifique
    // En production, vous pourriez avoir une table administrators
    const adminEmails = ['admin@fixhub.com', 'agency@fixhub.com'];
    return adminEmails.includes(session.user.email || '');
  },

  // Valider un technicien
  validateTechnician: async (technicianId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('technicians')
      .update({ 
        is_validated: true,
        status: 'validated'
      })
      .eq('id', technicianId);

    return !error;
  },

  // Rejeter un technicien
  rejectTechnician: async (technicianId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('technicians')
      .update({ 
        is_validated: false,
        status: 'rejected'
      })
      .eq('id', technicianId);

    return !error;
  },

  // Supprimer un technicien
  deleteTechnician: async (technicianId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('technicians')
      .delete()
      .eq('id', technicianId);

    return !error;
  }
};
