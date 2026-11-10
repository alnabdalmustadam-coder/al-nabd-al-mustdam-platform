import { createFixtureClient } from '@/lib/demo/client';
import type { User } from '@supabase/supabase-js';

const client = createFixtureClient({
  getUser: async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/demo/role', { cache: 'no-store' });
      return response.ok ? (await response.json()).user ?? null : null;
    } catch {
      return null;
    }
  },
  signOut: async () => { await fetch('/api/demo/role', { method: 'DELETE' }); },
});

export function createClient() {
  return client;
}
