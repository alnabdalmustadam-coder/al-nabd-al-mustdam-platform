import { NextResponse } from 'next/server';
import {
getAllArticlesAsync,
getArticlesStatsAsync
} from '@/lib/articles-store';
import { requireInstructorOrAdmin } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const [articles, stats] = await Promise.all([
      getAllArticlesAsync({ includeDrafts: true }),
      getArticlesStatsAsync(),
    ]);

    return NextResponse.json(
      {
        success: true,
        articles,
        stats,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/admin/articles GET error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل المقالات' }, { status: 500 });
  }
}
