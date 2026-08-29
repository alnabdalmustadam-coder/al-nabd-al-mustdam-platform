import 'server-only';

import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const GHL_ED25519_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAi2HR1srL4o18O8BRa7gVJY7G7bupbN3H9AwJrHCDiOg=
-----END PUBLIC KEY-----`;

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function verifyBasicAuth(request: Request): boolean {
  const username = process.env.XAPI_BASIC_USERNAME;
  const password = process.env.XAPI_BASIC_PASSWORD;
  if (!username || !password) return false;

  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Basic ')) return false;

  try {
    const decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) return false;
    return safeEqual(decoded.slice(0, separator), username) && safeEqual(decoded.slice(separator + 1), password);
  } catch {
    return false;
  }
}

export function xapiUnauthorizedResponse() {
  return NextResponse.json(
    { success: false, message: 'Unauthorized' },
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Sustain Pulse LRS"',
        'X-Experience-API-Version': '1.0.3',
      },
    },
  );
}

export function verifyGhlWebhook(rawBody: string, request: Request): boolean {
  const ghlSignature = request.headers.get('x-ghl-signature');
  if (ghlSignature && ghlSignature !== 'N/A') {
    try {
      return crypto.verify(
        null,
        Buffer.from(rawBody, 'utf8'),
        GHL_ED25519_PUBLIC_KEY,
        Buffer.from(ghlSignature, 'base64'),
      );
    } catch {
      return false;
    }
  }

  // Workflow "Send Webhook" calls may not use marketplace signatures. They
  // must include this project-owned secret as Bearer or x-webhook-secret.
  const sharedSecret = process.env.GHL_WEBHOOK_SECRET;
  if (!sharedSecret) return false;
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || '';
  const headerSecret = request.headers.get('x-webhook-secret') || '';
  return safeEqual(bearer || headerSecret, sharedSecret);
}

export async function readVerifiedGhlWebhook<T = Record<string, unknown>>(
  request: Request,
): Promise<{ ok: true; payload: T } | { ok: false; response: NextResponse }> {
  const rawBody = await request.text();
  if (!verifyGhlWebhook(rawBody, request)) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: 'Invalid webhook signature' }, { status: 401 }),
    };
  }

  let payload: T & { webhookId?: string };
  try {
    payload = JSON.parse(rawBody) as T & { webhookId?: string };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: 'Invalid JSON payload' }, { status: 400 }),
    };
  }

  if (payload.webhookId) {
    try {
      const { error } = await getSupabaseAdmin()
        .from('webhook_events')
        .insert({ id: payload.webhookId, provider: 'ghl' });

      if (error?.code === '23505') {
        return {
          ok: false,
          response: NextResponse.json({ success: true, duplicate: true }, { status: 200 }),
        };
      }
      if (error) {
        console.error('Webhook replay protection error:', error);
        return {
          ok: false,
          response: NextResponse.json({ success: false, message: 'Webhook store unavailable' }, { status: 503 }),
        };
      }
    } catch (error) {
      console.error('Webhook replay protection error:', error);
      return {
        ok: false,
        response: NextResponse.json({ success: false, message: 'Webhook store unavailable' }, { status: 503 }),
      };
    }
  }
  return { ok: true, payload };
}
