import { NextResponse } from 'next/server';
import {
getAllServicesAsync,
getServicesStatsAsync
} from '@/lib/services-store';
import { requireInstructorOrAdmin,isAdminRole } from '@/lib/security/auth';

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
