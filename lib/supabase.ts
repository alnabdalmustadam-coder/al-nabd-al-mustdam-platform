import 'server-only';

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim();

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('إعدادات الاتصال بقاعدة البيانات غير مكتملة');
  }

  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
  }

  return adminClient;
}

// Backward-compatible lazy facade. Keeping initialization lazy lets builds run
// without production secrets while every actual server operation still fails closed.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const client = getSupabaseAdmin() as unknown as Record<PropertyKey, unknown>;
    const value = client[property];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
