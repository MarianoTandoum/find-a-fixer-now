// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dvjwjrbqmzlwuycrdzou.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2andqcmJxbXpsd3V5Y3Jkem91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MDk5MTEsImV4cCI6MjA2MTI4NTkxMX0.7Sr3Biwhgl5whfOIEMMU4B6EqjUxVjzqbOLrS-6u7Ps";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);