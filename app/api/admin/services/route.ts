import { NextResponse } from 'next/server';
import {
  getAllServicesAsync,
  getServicesStatsAsync,
  saveServiceAsync,
  toggleServiceStatusAsync,
  toggleServiceFeaturedAsync,
  deleteServiceAsync,
} from '@/lib/services-store';
import { requireAdmin } from '@/lib/security/auth';
import { cleanString, readJsonObject, safeErrorMessage, ValidationError } from '@/lib/security/validation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const [services, stats] = await Promise.all([
      getAllServicesAsync({ includeInactive: true }),
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
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonObject(req);
    const title = cleanString(body.title, 'عنوان الخدمة', { min: 3, max: 250 });
    if (!title) {
      return NextResponse.json({ success: false, error: 'عنوان الخدمة مطلوب' }, { status: 400 });
    }

    const saved = await saveServiceAsync(
      {
        ...body,
        title,
        price: Number(body.price || 0),
      },
      auth.user.id
    );

    return NextResponse.json({ success: true, service: saved });
  } catch (err: unknown) {
    console.error('API /api/admin/services POST error:', err);
    return NextResponse.json(
      { success: false, error: safeErrorMessage(err, 'تعذر حفظ الخدمة') },
      { status: err instanceof ValidationError ? 400 : 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonObject(req);
    const id = cleanString(body.id, 'معرف الخدمة');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الخدمة مطلوب' }, { status: 400 });
    }

    if (typeof body.isActive === 'boolean') {
      await toggleServiceStatusAsync(id, body.isActive);
    }

    if (typeof body.isFeatured === 'boolean') {
      await toggleServiceFeaturedAsync(id, body.isFeatured);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API /api/admin/services PATCH error:', err);
    return NextResponse.json(
      { success: false, error: safeErrorMessage(err, 'تعذر تحديث الخدمة') },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف الخدمة مطلوب' }, { status: 400 });
    }

    const deleted = await deleteServiceAsync(id);
    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    console.error('API /api/admin/services DELETE error:', err);
    return NextResponse.json(
      { success: false, error: safeErrorMessage(err, 'تعذر حذف الخدمة') },
      { status: 500 }
    );
  }
}
