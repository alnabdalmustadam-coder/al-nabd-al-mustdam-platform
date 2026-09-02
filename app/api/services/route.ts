import { NextResponse } from 'next/server';
import { getAllServicesAsync } from '@/lib/services-store';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET() {
  try {
    const services = await getAllServicesAsync({ includeInactive: false });
    return NextResponse.json(
      { success: true, services },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/services GET error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل الخدمات' }, { status: 500 });
  }
}
