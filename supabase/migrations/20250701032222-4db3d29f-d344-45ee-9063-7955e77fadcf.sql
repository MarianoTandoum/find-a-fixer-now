
-- Create enum types
CREATE TYPE public.technician_status AS ENUM ('pending', 'validated', 'rejected', 'suspended');
CREATE TYPE public.mission_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'validated', 'rejected');
CREATE TYPE public.payment_operator AS ENUM ('orange_money', 'mtn_money');

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'client',
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Technicians table
CREATE TABLE public.technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  profession TEXT NOT NULL,
  city TEXT NOT NULL,
  profile_picture TEXT,
  identity_document TEXT,
  contract_signed BOOLEAN DEFAULT false,
  status technician_status DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_missions INTEGER DEFAULT 0,
  bio TEXT,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client requests table
CREATE TABLE public.client_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT,
  urgent BOOLEAN DEFAULT false,
  status mission_status DEFAULT 'pending',
  assigned_technician_id UUID REFERENCES technicians(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES client_requests(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  operator payment_operator NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  screenshot_url TEXT,
  status payment_status DEFAULT 'pending',
  receipt_url TEXT,
  validated_by UUID REFERENCES auth.users(id),
  validated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES client_requests(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES technicians(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  client_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for internal communication
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES client_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  sender_type TEXT NOT NULL, -- 'agency', 'technician', 'client'
  content TEXT NOT NULL,
  is_automatic BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for technicians (public read for validated technicians)
CREATE POLICY "Anyone can view validated technicians" ON public.technicians
  FOR SELECT USING (is_validated = true);

CREATE POLICY "Users can insert their technician profile" ON public.technicians
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their technician profile" ON public.technicians
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for client_requests (no auth required for creation)
CREATE POLICY "Anyone can create client requests" ON public.client_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view client requests" ON public.client_requests
  FOR SELECT USING (true);

-- RLS Policies for payments
CREATE POLICY "Anyone can create payments" ON public.payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view payments" ON public.payments
  FOR SELECT USING (true);

-- RLS Policies for reviews (public read)
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (true);

-- RLS Policies for messages
CREATE POLICY "Anyone can view messages" ON public.messages
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create messages" ON public.messages
  FOR INSERT WITH CHECK (true);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_technicians_updated_at
  BEFORE UPDATE ON public.technicians
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_client_requests_updated_at
  BEFORE UPDATE ON public.client_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
