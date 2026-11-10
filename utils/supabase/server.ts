import { cookies } from 'next/headers';
import { DEMO_COOKIE, demoUser } from '@/lib/demo/fixtures';
import { readDemoSessionRole } from '@/lib/demo/session';
import { demoServerClient } from '@/lib/demo/server';

export async function createClient() {
  const cookieStore = await cookies();
  return demoServerClient({
    getUser: async () => demoUser(readDemoSessionRole(cookieStore.get(DEMO_COOKIE)?.value)),
    signOut: async () => { cookieStore.delete(DEMO_COOKIE); },
  });
}
