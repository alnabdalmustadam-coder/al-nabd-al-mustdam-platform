import { NextResponse } from 'next/server';
import { getAllArticlesAsync, getArticleBySlugAsync } from '@/lib/articles-store';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category') || undefined;
    const tag = searchParams.get('tag') || undefined;
    const search = searchParams.get('q') || searchParams.get('search') || undefined;

    if (slug) {
      const article = await getArticleBySlugAsync(slug, { includeDrafts: false });
      if (!article) {
        return NextResponse.json({ success: false, error: 'المقال غير موجود' }, { status: 404 });
      }
      return NextResponse.json(
        { success: true, article },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          },
        }
      );
    }

    const articles = await getAllArticlesAsync({
      includeDrafts: false,
      category,
      tag,
      search,
    });

    return NextResponse.json(
      { success: true, articles },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (err: unknown) {
    console.error('API /api/articles GET error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل المقالات' }, { status: 500 });
  }
}
