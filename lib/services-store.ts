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
  category_id: string;
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

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'services-db.json');

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
 * Seed services into Supabase if the table exists but is empty
 */
async function seedSupabaseIfEmpty(localServices: ServiceItem[]): Promise<void> {
  try {
    const admin = getSupabaseAdmin();
    const { count, error } = await admin
      .from('services')
      .select('*', { count: 'exact', head: true });

    if (error) return; // Table might not exist or schema difference

    if (count === 0 && localServices.length > 0) {
      // Map and insert
      const rows = localServices.map((s) => ({
        title: s.title,
        description: s.description,
        long_description: s.detailed_text || s.description,
        price: s.price,
        currency: s.currency || 'SAR',
        delivery_days: s.delivery_days || 3,
        revision_count: s.revision_count || 1,
        thumbnail_url: s.image_url,
        tags: s.tags || [],
        status: s.status === 'active' ? 'active' : 'paused',
        rating_avg: s.rating_avg || 4.9,
        rating_count: s.rating_count || 0,
        orders_count: s.orders_count || 0,
        is_featured: Boolean(s.is_featured),
        created_at: s.created_at || new Date().toISOString(),
      }));

      await admin.from('services').insert(rows);
      logger.info('services.seeded_supabase', { count: rows.length });
    }
  } catch (err) {
    logger.warn('services.seed_skipped', { error: err });
  }
}

/**
 * Get all services (from Supabase if populated, or local fallback file)
 */
export async function getAllServicesAsync(options?: { includeInactive?: boolean }): Promise<ServiceItem[]> {
  let localList = readLocalServices();

  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from('services')
      .select('*, service_categories(name, slug)')
      .order('created_at', { ascending: false });

    if (!options?.includeInactive) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      // Map Supabase rows to ServiceItem
      const mapped: ServiceItem[] = data.map((row: any) => ({
        id: String(row.id),
        title: row.title,
        description: row.description || '',
        detailed_text: row.long_description || row.description,
        price: Number(row.price || 0),
        currency: row.currency || 'SAR',
        delivery_days: Number(row.delivery_days || 3),
        revision_count: Number(row.revision_count || 1),
        image_url: row.thumbnail_url || '/services/branding.jpg',
        tags: Array.isArray(row.tags) ? row.tags : [],
        status: row.status || 'active',
        rating_avg: Number(row.rating_avg || 4.9),
        rating_count: Number(row.rating_count || 0),
        orders_count: Number(row.orders_count || 0),
        is_featured: Boolean(row.is_featured),
        category_id: row.category_id || '',
        category_name: row.service_categories?.name || 'خدمات واستشارات عامة',
        category_slug: row.service_categories?.slug || 'general',
        provider_id: row.provider_id || undefined,
        provider_name: row.provider_name || 'مقدم خدمة معتمد',
        provider_role: row.provider_role || 'خبير معتمد في المنصة',
        deliverables: row.deliverables || [
          { title: 'تسليم الخدمة بالكامل وفق المعايير', desc: 'مخرجات متقنة ومراجعة' }
        ],
        requirements: row.requirements || 'تزويدنا بتفاصيل العمل المطلوب',
        created_at: row.created_at || new Date().toISOString(),
        updated_at: row.updated_at,
      }));

      // Keep local backup synchronized
      writeLocalServices(mapped);
      return mapped;
    } else if (localList.length > 0) {
      // Seed Supabase if empty
      seedSupabaseIfEmpty(localList).catch(() => {});
    }
  } catch (err) {
    logger.warn('services.fetch_db_failed_using_local', { error: err });
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
    // Try to get real orders count from service_orders
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
 * Save (create or update) a service
 */
export async function saveServiceAsync(
  serviceData: Partial<ServiceItem> & { title: string },
  actorId?: string
): Promise<ServiceItem> {
  const localList = readLocalServices();
  const existingIdx = serviceData.id
    ? localList.findIndex((s) => s.id === serviceData.id)
    : -1;

  const now = new Date().toISOString();
  const generatedId = serviceData.id || `srv-${Date.now()}`;

  const savedItem: ServiceItem = {
    id: generatedId,
    title: serviceData.title.trim(),
    description: serviceData.description || '',
    detailed_text: serviceData.detailed_text || serviceData.description || '',
    price: Number(serviceData.price || 0),
    currency: serviceData.currency || 'SAR',
    delivery_days: Number(serviceData.delivery_days || 3),
    revision_count: Number(serviceData.revision_count || 1),
    image_url: serviceData.image_url || '/services/branding.jpg',
    tags: Array.isArray(serviceData.tags) ? serviceData.tags : [],
    status: (serviceData.status as any) || 'active',
    rating_avg: Number(serviceData.rating_avg || 5.0),
    rating_count: Number(serviceData.rating_count || 0),
    orders_count: Number(serviceData.orders_count || 0),
    is_featured: Boolean(serviceData.is_featured),
    category_id: serviceData.category_id || 'cat-1',
    category_name: serviceData.category_name || 'خدمات واستشارات عامة',
    category_slug: serviceData.category_slug || 'general',
    provider_id: actorId || serviceData.provider_id,
    provider_name: serviceData.provider_name || 'إدارة المنصة المعتمدة',
    provider_role: serviceData.provider_role || 'خبير معتمد',
    deliverables: serviceData.deliverables || [
      { title: 'تسليم العمل كاملاً وفق المواصفات', desc: 'تنفيذ احترافي ومطابق للمعايير' },
    ],
    requirements: serviceData.requirements || 'تزويدنا بمتطلبات العمل',
    created_at: existingIdx >= 0 ? localList[existingIdx].created_at : now,
    updated_at: now,
  };

  // 1. Update in local file
  if (existingIdx >= 0) {
    localList[existingIdx] = savedItem;
  } else {
    localList.unshift(savedItem);
  }
  writeLocalServices(localList);

  // 2. Sync to Supabase if accessible
  try {
    const admin = getSupabaseAdmin();
    const dbPayload: Record<string, any> = {
      title: savedItem.title,
      description: savedItem.description,
      long_description: savedItem.detailed_text,
      price: savedItem.price,
      currency: savedItem.currency,
      delivery_days: savedItem.delivery_days,
      revision_count: savedItem.revision_count,
      thumbnail_url: savedItem.image_url,
      tags: savedItem.tags,
      status: savedItem.status === 'active' ? 'active' : 'paused',
      is_featured: savedItem.is_featured,
      updated_at: now,
    };

    // If ID is a valid UUID, try updating in Supabase
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedItem.id);
    if (isUuid && existingIdx >= 0) {
      await admin.from('services').update(dbPayload).eq('id', savedItem.id);
    } else if (existingIdx === -1) {
      // Try inserting into Supabase
      const { data: inserted } = await admin.from('services').insert([dbPayload]).select('id').maybeSingle();
      if (inserted?.id) {
        savedItem.id = inserted.id;
        localList[0].id = inserted.id;
        writeLocalServices(localList);
      }
    }
  } catch (err) {
    logger.warn('services.sync_to_db_failed', { error: err });
  }

  return savedItem;
}

/**
 * Toggle active status
 */
export async function toggleServiceStatusAsync(id: string, active: boolean): Promise<boolean> {
  const localList = readLocalServices();
  const item = localList.find((s) => s.id === id);
  if (!item) return false;

  item.status = active ? 'active' : 'paused';
  item.updated_at = new Date().toISOString();
  writeLocalServices(localList);

  try {
    const admin = getSupabaseAdmin();
    await admin
      .from('services')
      .update({ status: item.status, updated_at: item.updated_at })
      .eq('id', id);
  } catch (err) {
    logger.warn('services.db_toggle_failed', { error: err });
  }

  return true;
}

/**
 * Toggle featured status
 */
export async function toggleServiceFeaturedAsync(id: string, isFeatured: boolean): Promise<boolean> {
  const localList = readLocalServices();
  const item = localList.find((s) => s.id === id);
  if (!item) return false;

  item.is_featured = isFeatured;
  item.updated_at = new Date().toISOString();
  writeLocalServices(localList);

  try {
    const admin = getSupabaseAdmin();
    await admin
      .from('services')
      .update({ is_featured: isFeatured, updated_at: item.updated_at })
      .eq('id', id);
  } catch (err) {
    logger.warn('services.db_featured_toggle_failed', { error: err });
  }

  return true;
}

/**
 * Delete a service
 */
export async function deleteServiceAsync(id: string): Promise<boolean> {
  const localList = readLocalServices();
  const filtered = localList.filter((s) => s.id !== id);
  if (filtered.length === localList.length) return false;

  writeLocalServices(filtered);

  try {
    const admin = getSupabaseAdmin();
    await admin.from('services').delete().eq('id', id);
  } catch (err) {
    logger.warn('services.db_delete_failed', { error: err });
  }

  return true;
}
