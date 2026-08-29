import 'server-only';

import { NextResponse } from 'next/server';

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function getRequestIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function checkRateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number,
): NextResponse | null {
  const result = consumeRateLimit(`${scope}:${getRequestIp(request)}`, limit, windowMs);
  if (result.allowed) return null;

  return NextResponse.json(
    { success: false, message: 'محاولات كثيرة، حاول مرة أخرى بعد قليل' },
    { status: 429, headers: { 'Retry-After': String(result.retryAfter) } },
  );
}

export function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count <= limit) return { allowed: true, retryAfter: 0 };

  const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
  return { allowed: false, retryAfter };
}
