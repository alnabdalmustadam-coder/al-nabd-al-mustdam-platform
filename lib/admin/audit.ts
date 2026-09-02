import 'server-only';

import type { User } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getRequestIp } from '@/lib/security/rate-limit';
import { logger } from '@/lib/observability/logger';

const SAFE_METADATA_KEYS = new Set([
  'fields',
  'status',
  'role',
  'kind',
  'courseId',
  'templateId',
  'count',
]);

function safeMetadata(metadata: Record<string, unknown> | undefined) {
  if (!metadata) return {};
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => SAFE_METADATA_KEYS.has(key)));
}

async function hashIp(ip: string): Promise<string | null> {
  const salt = process.env.AUDIT_IP_SALT;
  if (!salt || ip === 'unknown') return null;
  const bytes = new TextEncoder().encode(`${salt}:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function recordAdminAudit(input: {
  request: Request;
  actor: User;
  action: string;
  resourceType: string;
  resourceId?: string | number | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const { error } = await getSupabaseAdmin().from('admin_audit_log').insert({
      actor_id: input.actor.id,
      actor_email: input.actor.email || null,
      action: input.action,
      resource_type: input.resourceType,
      resource_id: input.resourceId === undefined || input.resourceId === null ? null : String(input.resourceId),
      ip_hash: await hashIp(getRequestIp(input.request)),
      metadata: safeMetadata(input.metadata),
    });
    if (error) throw error;
  } catch (error) {
    // Audit failure is surfaced in structured logs but does not duplicate the
    // business mutation. Monitoring should alert on this event.
    logger.error('admin.audit.write_failed', { error, action: input.action, resourceType: input.resourceType });
  }
}
