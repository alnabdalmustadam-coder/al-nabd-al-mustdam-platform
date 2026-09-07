import { NextResponse } from 'next/server';
import {
  getAllServicesAsync,
  getServicesStatsAsync,
  saveServiceAsync,
  toggleServiceStatusAsync,
  toggleServiceFeaturedAsync,
  deleteServiceAsync,
  ServicePersistenceError,
  type ServiceItem,
} from '@/lib/services-store';
import { requireInstructorOrAdmin, isAdminRole } from '@/lib/security/auth';
import { cleanString, readJsonObject, safeErrorMessage, ValidationError } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const isAdmin = isAdminRole(auth.role);
    const [services, stats] = await Promise.all([
      getAllServicesAsync(
        isAdmin ? { includeInactive: true } : { includeInactive: true, providerId: auth.user.id }
      ),
      getServicesStatsAsync(),
    ]);

    return NextResponse.json(
      {
        success: true,
        services,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/admin/services GET error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل الخدمات' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonObject(req);
    const title = cleanString(body.title, 'عنوان الخدمة', { min: 3, max: 250 });
    if (!title) {
      return NextResponse.json({ success: false, error: 'عنوان الخدمة مطلوب' }, { status: 400 });
    }

    const isAdmin = isAdminRole(auth.role);
    if (!isAdmin && body.id) {
      const all = await getAllServicesAsync({ includeInactive: true });
      const target = all.find((s) => s.id === body.id);
      if (target && target.provider_id && target.provider_id !== auth.user.id) {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية لتعديل هذه الخدمة' },
          { status: 403 }
        );
      }
    }

    const providerId: string =
      isAdmin && typeof body.provider_id === 'string' && body.provider_id.trim()
        ? body.provider_id.trim()
        : auth.user.id;

    const saved = await saveServiceAsync(
      {
        ...(body as Partial<ServiceItem>),
        title,
        price: Number(body.price || 0),
        provider_id: providerId,
      },
      auth.user.id
    );

    return NextResponse.json({ success: true, service: saved });
  } catch (err: unknown) {
    console.error('API /api/admin/services POST error:', err);
    const status = err instanceof ValidationError ? 400 : 500;
    const msg = err instanceof ServicePersistenceError ? err.message : safeErrorMessage(err, 'تعذر حفظ الخدمة');
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonObject(req);
    const id = cleanString(body.id, 'معرف الخدمة');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الخدمة مطلوب' }, { status: 400 });
    }

    const isAdmin = isAdminRole(auth.role);
    if (!isAdmin) {
      const all = await getAllServicesAsync({ includeInactive: true });
      const target = all.find((s) => s.id === id);
      if (target && target.provider_id && target.provider_id !== auth.user.id) {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية لتعديل هذه الخدمة' },
          { status: 403 }
        );
      }
    }

    if (typeof body.isActive === 'boolean') {
      await toggleServiceStatusAsync(id, body.isActive);
    }

    if (typeof body.isFeatured === 'boolean') {
      if (!isAdmin) {
        return NextResponse.json(
          { success: false, error: 'تمييز الخدمة متاح للإدارة فقط' },
          { status: 403 }
        );
      }
      await toggleServiceFeaturedAsync(id, body.isFeatured);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API /api/admin/services PATCH error:', err);
    const msg = err instanceof ServicePersistenceError ? err.message : safeErrorMessage(err, 'تعذر تحديث الخدمة');
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الخدمة مطلوب' }, { status: 400 });
    }

    const isAdmin = isAdminRole(auth.role);
    if (!isAdmin) {
      const all = await getAllServicesAsync({ includeInactive: true });
      const target = all.find((s) => s.id === id);
      if (target && target.provider_id && target.provider_id !== auth.user.id) {
        return NextResponse.json(
          { success: false, error: 'ليس لديك صلاحية لحذف هذه الخدمة' },
          { status: 403 }
        );
      }
    }

    const deleted = await deleteServiceAsync(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    console.error('API /api/admin/services DELETE error:', err);
    const msg = err instanceof ServicePersistenceError ? err.message : safeErrorMessage(err, 'تعذر حذف الخدمة');
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
