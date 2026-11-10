import { createHmac, timingSafeEqual } from 'node:crypto';
import { isDemoRole, type DemoRole } from './fixtures';

/**
 * Publicly shareable, READ-ONLY demonstration accounts.
 *
 * Set MADAR_DEMO_SESSION_SECRET in Vercel for unpredictable signatures.
 * The fallback only keeps the isolated demo operational; it is not suitable
 * for production authentication or any privileged data access.
 */
const SESSION_SECRET =
  process.env.MADAR_DEMO_SESSION_SECRET || 'madar-readonly-public-demo-fallback-nov-2026-v2';
const TTL_SECONDS = 8 * 60 * 60;

function sign(payload: string): string {
  return createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export function issueDemoSession(role: DemoRole): string {
  const expiresAt = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = role + '.' + expiresAt;
  return payload + '.' + sign(payload);
}

export function readDemoSessionRole(value: string | undefined | null): DemoRole | null {
  if (!value || value.length > 200) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [role, expiry, mac] = parts;
  if (!isDemoRole(role) || !/^\d{10}$/.test(expiry) || !/^[a-f0-9]{64}$/.test(mac)) return null;
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = Number(expiry);
  if (expiresAt <= now || expiresAt > now + TTL_SECONDS) return null;
  const expected = Buffer.from(sign(role + '.' + expiry), 'hex');
  const supplied = Buffer.from(mac, 'hex');
  return supplied.length === expected.length && timingSafeEqual(supplied, expected) ? role : null;
}
