import type { SupabaseClient, User } from '@supabase/supabase-js';
import { demoAccounts, demoSatisfaction, demoTables, DEMO_READ_ONLY, type DemoRow } from './fixtures';

const readOnly = () => ({ message: DEMO_READ_ONLY, code: 'DEMO_READ_ONLY' });
type Reply = { data: DemoRow | DemoRow[] | null; error: ReturnType<typeof readOnly> | null; count: number | null };
type ReadRows = (table: string) => readonly DemoRow[];
type GetUser = () => Promise<User | null>;

const equal = (a: unknown, b: unknown) => a === b ||
  (a != null && b != null && typeof a !== 'object' && typeof b !== 'object' && String(a) === String(b));

/** Read-only subset used by the original dashboards. Queries return copies of the fixtures. */
class FixtureQuery implements PromiseLike<Reply> {
  private filters: ((row: DemoRow) => boolean)[] = [];
  private ordering: { key: string; descending: boolean }[] = [];
  private offset = 0;
  private size = Infinity;
  private countRows = false;
  private head = false;
  private shape: 'array' | 'single' | 'maybe' = 'array';
  private mutation = false;

  constructor(private readonly read: () => readonly DemoRow[]) {}

  select(_columns = '*', options?: { count?: string; head?: boolean }) {
    this.countRows = Boolean(options?.count);
    this.head = Boolean(options?.head);
    return this;
  }

  eq(key: string, value: unknown) { this.filters.push(row => equal(row[key], value)); return this; }
  neq(key: string, value: unknown) { this.filters.push(row => !equal(row[key], value)); return this; }
  in(key: string, values: unknown[]) { this.filters.push(row => values.some(value => equal(row[key], value))); return this; }
  is(key: string, value: unknown) { this.filters.push(row => equal(row[key] ?? null, value)); return this; }
  gte(key: string, value: string | number) { this.filters.push(row => row[key] != null && (row[key] as string | number) >= value); return this; }
  lte(key: string, value: string | number) { this.filters.push(row => row[key] != null && (row[key] as string | number) <= value); return this; }

  ilike(key: string, pattern: string) {
    const escaped = pattern.split('%').map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('.*');
    const matches = new RegExp('^' + escaped + '$', 'iu');
    this.filters.push(row => matches.test(String(row[key] ?? '')));
    return this;
  }

  or(expression: string) {
    const options = expression.split(',').map(condition => condition.split('.eq.'));
    this.filters.push(row => options.some(([key, value]) => value !== undefined && equal(row[key], value)));
    return this;
  }

  order(key: string, options?: { ascending?: boolean }) {
    this.ordering.push({ key, descending: options?.ascending === false });
    return this;
  }
  limit(size: number) { this.size = Math.max(0, size); return this; }
  range(from: number, to: number) { this.offset = from; this.size = Math.max(0, to - from + 1); return this; }
  single() { this.shape = 'single'; return this; }
  maybeSingle() { this.shape = 'maybe'; return this; }
  insert() { this.mutation = true; return this; }
  update() { return this.insert(); }
  upsert() { return this.insert(); }
  delete() { return this.insert(); }

  private execute(): Reply {
    if (this.mutation) return { data: null, error: readOnly(), count: null };
    const rows = this.read().filter(row => this.filters.every(filter => filter(row)));
    const count = this.countRows ? rows.length : null;
    if (this.head) return { data: null, error: null, count };
    if (this.ordering.length) rows.sort((a, b) => {
      for (const { key, descending } of this.ordering) {
        const left = a[key], right = b[key];
        const result = typeof left === 'number' && typeof right === 'number'
          ? left - right : String(left ?? '').localeCompare(String(right ?? ''), 'ar');
        if (result) return descending ? -result : result;
      }
      return 0;
    });
    const page = structuredClone(rows.slice(this.offset, this.offset + this.size));
    if (this.shape !== 'array') {
      if (page.length > 1 || (this.shape === 'single' && !page.length)) {
        return { data: null, error: { code: 'PGRST116', message: 'السجل المطلوب غير متاح في بيانات العرض.' }, count };
      }
      return { data: page[0] ?? null, error: null, count };
    }
    return { data: page, error: null, count };
  }

  then<T = Reply, U = never>(
    onFulfilled?: ((reply: Reply) => T | PromiseLike<T>) | null,
    onRejected?: ((reason: unknown) => U | PromiseLike<U>) | null,
  ): PromiseLike<T | U> {
    return Promise.resolve().then(() => this.execute()).then(onFulfilled, onRejected);
  }
}

export function createFixtureClient({
  getUser = async () => null, signOut = async () => {},
  readRows = (table) => demoTables[table] ?? [],
}: { getUser?: GetUser; signOut?: () => Promise<void>; readRows?: ReadRows } = {}): SupabaseClient {
  const userReply = async () => ({ data: { user: await getUser() }, error: null });
  const reject = async () => ({ data: null, error: readOnly() });
  return {
    from: (table: string) => new FixtureQuery(() => readRows(table)),
    rpc: async (name: string) => name === 'course_satisfaction_summary'
      ? { data: structuredClone(demoSatisfaction), error: null } : reject(),
    auth: {
      getUser: userReply,
      getSession: async () => {
        const user = await getUser();
        return { data: { session: user ? { user } : null }, error: null };
      },
      signOut: async () => { await signOut(); return { error: null }; },
      signInWithPassword: reject, signInWithOAuth: reject, signUp: reject, resend: reject,
      resetPasswordForEmail: reject, verifyOtp: reject, updateUser: reject, exchangeCodeForSession: reject,
      mfa: { getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: 'aal1', nextLevel: 'aal1' }, error: null }) },
      admin: {
        listUsers: async () => ({ data: { users: structuredClone(demoAccounts) }, error: null }),
        createUser: reject, updateUserById: reject, deleteUser: reject, generateLink: reject,
      },
    },
    storage: {
      from: () => ({ getPublicUrl: () => ({ data: { publicUrl: '/demo/madar/avatar.svg' } }),
        upload: reject, remove: reject, createSignedUrl: reject, list: reject }),
    },
  } as unknown as SupabaseClient;
}
