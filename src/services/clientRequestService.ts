
import { supabase } from "@/integrations/supabase/client";

export interface ClientRequest {
  id: string;
  client_name: string;
  client_phone: string;
  service_type: string;
  city: string;
  description?: string;
  urgent: boolean;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assigned_technician_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  request_id: string;
  phone_number: string;
  operator: 'orange_money' | 'mtn_money';
  amount: number;
  screenshot_url?: string;
  status: 'pending' | 'validated' | 'rejected';
  receipt_url?: string;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
}

export const clientRequestService = {
  createRequest: async (requestData: Omit<ClientRequest, 'id' | 'status' | 'created_at' | 'updated_at'>): Promise<ClientRequest | null> => {
    const { data, error } = await supabase
      .from('client_requests')
      .insert([requestData])
      .select()
      .single();

    if (error) {
      console.error('Error creating client request:', error);
      return null;
    }

    return data as ClientRequest;
  },

  getAllRequests: async (): Promise<ClientRequest[]> => {
    const { data, error } = await supabase
      .from('client_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching client requests:', error);
      return [];
    }

    return (data as ClientRequest[]) || [];
  },

  updateRequestStatus: async (requestId: string, status: ClientRequest['status'], technicianId?: string): Promise<boolean> => {
    const updateData: any = { status };
    if (technicianId) updateData.assigned_technician_id = technicianId;

    const { error } = await supabase
      .from('client_requests')
      .update(updateData)
      .eq('id', requestId);

    return !error;
  },

  createPayment: async (paymentData: Omit<Payment, 'id' | 'status' | 'created_at'>): Promise<Payment | null> => {
    const { data, error } = await supabase
      .from('payments')
      .insert([{ ...paymentData, status: 'pending' }])
      .select()
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return null;
    }

    return data as Payment;
  },

  getPaymentsByRequest: async (requestId: string): Promise<Payment[]> => {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payments:', error);
      return [];
    }

    return (data as Payment[]) || [];
  },

  validatePayment: async (paymentId: string): Promise<boolean> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'validated',
        validated_by: session.user.id,
        validated_at: new Date().toISOString()
      })
      .eq('id', paymentId);

    return !error;
  }
};
