import 'server-only';
import { timingSafeEqual } from 'node:crypto';
import type { DemoRole } from './fixtures';

/**
 * Shareable showcase credentials, never real Supabase accounts.
 * To rotate for the public demo, configure MADAR_DEMO_*_PASSWORD on Vercel.
 */
const ACCOUNTS: ReadonlyArray<{ role: DemoRole; email: string; password: string }> = [
  { role: 'student', email: 'learner@madar.example', password: process.env.MADAR_DEMO_STUDENT_PASSWORD || 'MadarStudent@2026' },
  { role: 'instructor', email: 'trainer@madar.example', password: process.env.MADAR_DEMO_INSTRUCTOR_PASSWORD || 'MadarTrainer@2026' },
  { role: 'admin', email: 'admin@madar.example', password: process.env.MADAR_DEMO_ADMIN_PASSWORD || 'MadarAdmin@2026' },
];

function equalPassword(actual: string, expected: string): boolean {
  const actualBytes = Buffer.from(actual, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export function authenticateDemoAccount(email: string, password: string): DemoRole | null {
  const entry = ACCOUNTS.find(account => account.email === email.trim().toLowerCase());
  return entry && equalPassword(password, entry.password) ? entry.role : null;
}
