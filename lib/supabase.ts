import 'server-only';
import { demoServerClient } from '@/lib/demo/server';

const client = demoServerClient();

export function getSupabaseAdmin() {
  return client;
}

export const supabase = client;
