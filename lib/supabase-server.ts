import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: false } });
  return client;
}

export type AppointmentRow = {
  id: string;
  date: string;
  time_slot: string;
  full_name: string;
  phone: string;
  governorate: string;
  address_line: string;
  sub_services: string[];
  notes: string | null;
  created_at: string;
};
