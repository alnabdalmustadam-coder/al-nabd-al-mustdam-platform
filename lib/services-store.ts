import 'server-only';

import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/observability/logger';

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  detailed_text?: string;
  price: number;
  currency: string;
  delivery_days: number;
  revision_count: number;
  image_url: string;
  tags: string[];
  status: 'active' | 'paused' | 'archived' | 'pending_review';
  rating_avg: number;
  rating_count: number;
  orders_count: number;
  is_featured: boolean;
  category_id?: string | null;
  category_name: string;
  category_slug: string;
  provider_id?: string;
  provider_name: string;
  provider_role: string;
  deliverables?: { title: string; desc: string }[];
  requirements?: string;
  created_at: string;
  updated_at?: string;
}

export class ServicePersistenceError extends Error {
  constructor(message = 'تعذر حفظ الخدمة في قاعدة البيانات') {
    super(message);
    this.name = 'ServicePersistenceError';
  }
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'services-db.json');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidUuid(val?: string | null): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val);
}

function readLocalServices(): ServiceItem[] {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf8');
      return JSON.parse(data) as ServiceItem[];
    }
  } catch (err) {
    logger.error('services.read_local_failed', { error: err });
  }
  return [];
}

function writeLocalServices(services: ServiceItem[]): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(services, null, 2), 'utf8');
  } catch (err) {
    logger.error('services.write_local_failed', { error: err });
  }
}

/**
 * Resolve a valid UUID category_id by matching name or slug in service_categories table
 */
async function resolveCategoryId(
  admin: ReturnType<typeof getSupabaseAdmin>,
  categoryId?: string | null,
  categoryName?: string | null,
  categorySlug?: string | null
): Promise<string | null> {
  if (isValidUuid(categoryId)) {
    return categoryId as string;
  }

  try {
    const { data: categories } = await admin
      .from('service_categories')
      .select('id, name, slug');

    if (categories && categories.length > 0) {
      if (categorySlug) {
        const bySlug = categories.find((c: any) => c.slug === categorySlug);
        if (bySlug?.id) return bySlug.id;
      }
      if (categoryName) {
        const byName = categories.find((c: any) => c.name === categoryName);
        if (byName?.id) return byName.id;
      }
      if (categoryId) {
        const byId = categories.find((c: any) => c.id === categoryId);
        if (byId?.id) return byId.id;
      }
    }
  } catch (err) {
    logger.warn('services.resolve_category_failed', { error: err });
  }

  return null;
}

/**
 * Seed initial services into Supabase if the table is empty
 */
async function seedSupabaseIfEmpty(localServices: ServiceItem[]): Promise<void> {
  if (!localServices || localServices.length === 0) return;

  try {
    const admin = getSupabaseAdmin();
    const { count, error } = await admin
      .from('services')
      .select('id', { count: 'exact', head: true });

    if (error || (count !== null && count > 0)) {
      return;
    }

    const { data: categories } = await admin
      .from('service_categories')
      .select('id, name, slug');

    const rows = localServices.map((s) => {
      let catId: string | null = null;
      if (categories && categories.length > 0) {
        const found = categories.find(
          (c: any) => c.slug === s.category_slug || c.name === s.category_name
        );
        if (found?.id) catId = found.id;
      }

      return {
        title: s.title,
        description: s.description || '',
        long_description: s.detailed_text || s.description || '',
        price: Number(s.price || 0),
        currency: s.currency || 'SAR',
        delivery_days: Number(s.delivery_days || 3),
        revision_count: Number(s.revision_count || 1),
        thumbnail_url: s.image_url || '/services/branding.jpg',
        tags: Array.isArray(s.tags) ? s.tags : [],
        deliverables: Array.isArray(s.deliverables) ? s.deliverables : [],
        requirements: s.requirements || '',
        provider_name: s.provider_name || 'إدارة المنصة المعتمدة',
        provider_role: s.provider_role || 'خبير معتمد في المنصة',
        status: s.status === 'active' ? 'active' : 'paused',
        rating_avg: Number(s.rating_avg || 5.0),
        rating_count: Number(s.rating_count || 0),
        orders_count: Number(s.orders_count || 0),
        is_featured: Boolean(s.is_featured),
        category_id: catId,
        created_at: s.created_at || new Date().toISOString(),
        updated_at: s.updated_at || new Date().toISOString(),
      };
    });

    await admin.from('services').insert(rows);
    logger.info('services.seeded_supabase', { count: rows.length });
  } catch (err) {
    logger.warn('services.seed_skipped', { error: err });
  }
}

function mapRowToServiceItem(row: any): ServiceItem {
  return {
    id: String(row.id),
    title: row.title || '',
    description: row.description || '',
    detailed_text: row.long_description || row.description || '',
    price: Number(row.price || 0),
    currency: row.currency || 'SAR',
    delivery_days: Number(row.delivery_days || 3),
    revision_count: Number(row.revision_count || 1),
    image_url: row.thumbnail_url || '/services/branding.jpg',
    tags: Array.isArray(row.tags) ? row.tags : [],
    status: row.status || 'active',
    rating_avg: Number(row.rating_avg || 5.0),
    rating_count: Number(row.rating_count || 0),
    orders_count: Number(row.orders_count || 0),
    is_featured: Boolean(row.is_featured),
    category_id: row.category_id || null,
    category_name: row.service_categories?.name || 'خدمات واستشارات عامة',
    category_slug: row.service_categories?.slug || 'general',
    provider_id: row.provider_id || undefined,
    provider_name: row.provider_name || 'إدارة المنصة المعتمدة',
    provider_role: row.provider_role || 'خبير معتمد في المنصة',
    deliverables: Array.isArray(row.deliverables) && row.deliverables.length > 0
      ? row.deliverables.map((d: any) => typeof d === 'string' ? { title: d, desc: 'تسليم معتمد' } : d)
      : [{ title: 'تسليم كامل للخدمة وفق المتطلبات', desc: 'مخرجات متقنة ومراجعة' }],
    requirements: row.requirements || 'تزويدنا بتفاصيل العمل المطلوب',
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at,
  };
}

/**
 * Get all services (from Supabase as Single Source of Truth)
 */
export async function getAllServicesAsync(options?: {
  includeInactive?: boolean;
  providerId?: string;
}): Promise<ServiceItem[]> {
  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from('services')
      .select('*, service_categories(name, slug)')
      .order('created_at', { ascending: false });

    if (!options?.includeInactive) {
      query = query.eq('status', 'active');
    }

    if (options?.providerId) {
      query = query.eq('provider_id', options.providerId);
    }

    const { data, error } = await query;

    if (!error && data) {
      if (data.length === 0 && !options?.providerId) {
        const localList = readLocalServices();
        if (localList.length > 0) {
          await seedSupabaseIfEmpty(localList);
          const { data: recheck } = await query;
          if (recheck && recheck.length > 0) {
            const mapped = recheck.map(mapRowToServiceItem);
            writeLocalServices(mapped);
            return mapped;
          }
        }
      }

      const mapped = data.map(mapRowToServiceItem);
      writeLocalServices(mapped);
      return mapped;
    }

    if (error) {
      logger.warn('services.fetch_supabase_error', { error: error.message });
    }
  } catch (err) {
    logger.warn('services.fetch_db_failed_using_local', { error: err });
  }

  // Fallback to local file if Supabase fails
  let localList = readLocalServices();
  if (options?.providerId) {
    localList = localList.filter((s) => s.provider_id === options.providerId);
  }
  if (!options?.includeInactive) {
    return localList.filter((s) => s.status === 'active');
  }
  return localList;
}

/**
 * Get real service statistics: counts, orders, real revenue
 */
export async function getServicesStatsAsync(): Promise<{
  totalServices: number;
  activeServices: number;
  totalOrders: number;
  totalRevenue: number;
}> {
  const allServices = await getAllServicesAsync({ includeInactive: true });
  const activeCount = allServices.filter((s) => s.status === 'active').length;

  let totalOrders = 0;
  let totalRevenue = 0;

  try {
    const admin = getSupabaseAdmin();
    const { count, data } = await admin
      .from('service_orders')
      .select('price, status', { count: 'exact' });

    if (count !== null && count !== undefined) {
      totalOrders = count;
    }

    if (data && data.length > 0) {
      totalRevenue = data
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (Number(o.price) || 0), 0);
    }
  } catch (err) {
    logger.warn('services.stats_orders_failed', { error: err });
  }

  return {
    totalServices: allServices.length,
    activeServices: activeCount,
    totalOrders,
    totalRevenue,
  };
}

/**
 * Save (create or update) a service with strict persistence
 */
export async function saveServiceAsync(
  serviceData: Partial<ServiceItem> & { title: string },
  actorId?: string
): Promise<ServiceItem> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  // 1. Resolve valid category_id
  const resolvedCategoryId = await resolveCategoryId(
    admin,
    serviceData.category_id,
    serviceData.category_name,
    serviceData.category_slug
  );

  // 2. Prepare deliverables in normalized shape
  const deliverables = Array.isArray(serviceData.deliverables)
    ? serviceData.deliverables.map((d: any) =>
        typeof d === 'string'
          ? { title: d, desc: 'تنفيذ احترافي ومطابق للمعايير' }
          : { title: d.title || '', desc: d.desc || '' }
      )
    : [{ title: 'تسليم العمل كاملاً وفق المواصفات', desc: 'تنفيذ احترافي ومطابق للمعايير' }];

  const dbPayload: Record<string, any> = {
    title: serviceData.title.trim(),
    description: serviceData.description || '',
    long_description: serviceData.detailed_text || serviceData.description || '',
    price: Number(serviceData.price || 0),
    currency: serviceData.currency || 'SAR',
    delivery_days: Number(serviceData.delivery_days || 3),
    revision_count: Number(serviceData.revision_count || 1),
    thumbnail_url: serviceData.image_url || '/services/branding.jpg',
    tags: Array.isArray(serviceData.tags) ? serviceData.tags : [],
    deliverables,
    requirements: serviceData.requirements || '',
    provider_name: serviceData.provider_name || 'إدارة المنصة المعتمدة',
    provider_role: serviceData.provider_role || 'خبير معتمد في المنصة',
    status: ['active', 'paused', 'archived', 'pending_review'].includes(serviceData.status as string)
      ? serviceData.status
      : 'active',
    is_featured: Boolean(serviceData.is_featured),
    category_id: resolvedCategoryId,
    updated_at: now,
  };

  if (isValidUuid(actorId)) {
    dbPayload.provider_id = actorId;
  } else if (isValidUuid(serviceData.provider_id)) {
    dbPayload.provider_id = serviceData.provider_id;
  }

  // 3. Find existing record to prevent accidental duplicate insertions
  let targetId: string | null = isValidUuid(serviceData.id) ? (serviceData.id as string) : null;

  if (!targetId && serviceData.title) {
    const { data: matchedTitle } = await admin
      .from('services')
      .select('id')
      .ilike('title', serviceData.title.trim())
      .maybeSingle();

    if (matchedTitle?.id) {
      targetId = matchedTitle.id;
    }
  }

  let savedRow: any = null;

  if (targetId) {
    // Update existing row
    const { data: updated, error: updateErr } = await admin
      .from('services')
      .update(dbPayload)
      .eq('id', targetId)
      .select('*, service_categories(name, slug)')
      .single();

    if (updateErr) {
      logger.error('services.update_failed', { error: updateErr, id: targetId });
      throw new ServicePersistenceError(
        `تعذر تحديث بيانات الخدمة في قاعدة البيانات: ${updateErr.message}`
      );
    }
    savedRow = updated;
  } else {
    // Insert new service
    dbPayload.created_at = now;
    const { data: inserted, error: insertErr } = await admin
      .from('services')
      .insert([dbPayload])
      .select('*, service_categories(name, slug)')
      .single();

    if (insertErr) {
      logger.error('services.insert_failed', { error: insertErr });
      throw new ServicePersistenceError(
        `تعذر إضافة الخدمة الجديدة في قاعدة البيانات: ${insertErr.message}`
      );
    }
    savedRow = inserted;
  }

  const resultItem = mapRowToServiceItem(savedRow);

  // Sync snapshot to local file
  try {
    const localList = readLocalServices();
    const existingIdx = localList.findIndex((s) => s.id === resultItem.id);
    if (existingIdx >= 0) {
      localList[existingIdx] = resultItem;
    } else {
      localList.unshift(resultItem);
    }
    writeLocalServices(localList);
  } catch (err) {
    logger.warn('services.sync_local_snapshot_failed', { error: err });
  }

  return resultItem;
}

/**
 * Toggle active status
 */
export async function toggleServiceStatusAsync(id: string, active: boolean): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const status = active ? 'active' : 'paused';
  const now = new Date().toISOString();

  let targetId = isValidUuid(id) ? id : null;
  if (!targetId) {
    const local = readLocalServices().find((s) => s.id === id);
    if (local?.title) {
      const { data: matched } = await admin
        .from('services')
        .select('id')
        .ilike('title', local.title.trim())
        .maybeSingle();
      if (matched?.id) targetId = matched.id;
    }
  }

  if (!targetId) {
    throw new ServicePersistenceError('معرف الخدمة غير صالح');
  }

  const { error } = await admin
    .from('services')
    .update({ status, updated_at: now })
    .eq('id', targetId);

  if (error) {
    logger.error('services.toggle_status_failed', { error, id: targetId });
    throw new ServicePersistenceError(`تعذر تحديث حالة الخدمة: ${error.message}`);
  }

  // Update local snapshot
  const localList = readLocalServices();
  const item = localList.find((s) => s.id === id || s.id === targetId);
  if (item) {
    item.status = status;
    item.updated_at = now;
    writeLocalServices(localList);
  }

  return true;
}

/**
 * Toggle featured status
 */
export async function toggleServiceFeaturedAsync(id: string, isFeatured: boolean): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  let targetId = isValidUuid(id) ? id : null;
  if (!targetId) {
    const local = readLocalServices().find((s) => s.id === id);
    if (local?.title) {
      const { data: matched } = await admin
        .from('services')
        .select('id')
        .ilike('title', local.title.trim())
        .maybeSingle();
      if (matched?.id) targetId = matched.id;
    }
  }

  if (!targetId) {
    throw new ServicePersistenceError('معرف الخدمة غير صالح');
  }

  const { error } = await admin
    .from('services')
    .update({ is_featured: isFeatured, updated_at: now })
    .eq('id', targetId);

  if (error) {
    logger.error('services.toggle_featured_failed', { error, id: targetId });
    throw new ServicePersistenceError(`تعذر تحديث تمييز الخدمة: ${error.message}`);
  }

  // Update local snapshot
  const localList = readLocalServices();
  const item = localList.find((s) => s.id === id || s.id === targetId);
  if (item) {
    item.is_featured = isFeatured;
    item.updated_at = now;
    writeLocalServices(localList);
  }

  return true;
}

/**
 * Delete a service
 */
export async function deleteServiceAsync(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();

  let targetId = isValidUuid(id) ? id : null;
  if (!targetId) {
    const local = readLocalServices().find((s) => s.id === id);
    if (local?.title) {
      const { data: matched } = await admin
        .from('services')
        .select('id')
        .ilike('title', local.title.trim())
        .maybeSingle();
      if (matched?.id) targetId = matched.id;
    }
  }

  if (!targetId) {
    throw new ServicePersistenceError('معرف الخدمة غير صالح');
  }

  const { error } = await admin.from('services').delete().eq('id', targetId);

  if (error) {
    logger.error('services.delete_failed', { error, id: targetId });
    throw new ServicePersistenceError(`تعذر حذف الخدمة من قاعدة البيانات: ${error.message}`);
  }

  // Remove from local snapshot
  const localList = readLocalServices();
  const filtered = localList.filter((s) => s.id !== id && s.id !== targetId);
  writeLocalServices(filtered);

  return true;
}
