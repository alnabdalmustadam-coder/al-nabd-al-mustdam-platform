import { NextResponse } from 'next/server';
import {
  getAllArticlesAsync,
  getArticlesStatsAsync,
  saveArticleAsync,
  toggleArticleStatusAsync,
  toggleArticleFeaturedAsync,
  deleteArticleAsync,
  ArticlePersistenceError,
} from '@/lib/articles-store';
import { requireInstructorOrAdmin } from '@/lib/security/auth';
import { recordAdminAudit } from '@/lib/admin/audit';
import { cleanString, readJsonObject, safeErrorMessage, ValidationError } from '@/lib/security/validation';

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

export async function POST(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonObject(req);
    const title = cleanString(body.title, 'عنوان المقال', { min: 3, max: 250 });
    if (!title) {
      return NextResponse.json({ success: false, error: 'عنوان المقال مطلوب' }, { status: 400 });
    }

    const saved = await saveArticleAsync(
      {
        ...body,
        title,
      },
      auth.user.id
    );

    if (auth.user) {
      await recordAdminAudit({
        request: req,
        actor: auth.user,
        action: 'article.upsert',
        resourceType: 'article',
        resourceId: saved.slug,
        metadata: { title: saved.title },
      });
    }

    return NextResponse.json({ success: true, article: saved });
  } catch (err: unknown) {
    console.error('API /api/admin/articles POST error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof ArticlePersistenceError
          ? err.message
          : safeErrorMessage(err, 'تعذر حفظ المقال'),
      },
      { status: err instanceof ValidationError ? 400 : err instanceof ArticlePersistenceError ? 503 : 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const body = await readJsonObject(req);
    const id = cleanString(body.id || body.slug, 'معرف المقال');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    const statusVal = typeof body.status === 'string' ? body.status : undefined;
    if (statusVal && ['published', 'draft', 'archived'].includes(statusVal)) {
      await toggleArticleStatusAsync(id, statusVal as 'published' | 'draft' | 'archived', auth.user.id);
    }

    if (typeof body.isFeatured === 'boolean') {
      await toggleArticleFeaturedAsync(id, body.isFeatured, auth.user.id);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('API /api/admin/articles PATCH error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof ArticlePersistenceError
          ? err.message
          : safeErrorMessage(err, 'تعذر تحديث حالة المقال'),
      },
      { status: err instanceof ArticlePersistenceError ? 503 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await requireInstructorOrAdmin(req);
    if (!auth.ok) return auth.response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id') || searchParams.get('slug');
    if (!id) {
      return NextResponse.json({ success: false, error: 'معرف المقال مطلوب' }, { status: 400 });
    }

    const deleted = await deleteArticleAsync(id);
    if (deleted) {
      await recordAdminAudit({
        request: req,
        actor: auth.user,
        action: 'article.delete',
        resourceType: 'article',
        resourceId: id,
      });
    }

    return NextResponse.json({ success: deleted });
  } catch (err: unknown) {
    console.error('API /api/admin/articles DELETE error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof ArticlePersistenceError
          ? err.message
          : safeErrorMessage(err, 'تعذر حذف المقال'),
      },
      { status: err instanceof ArticlePersistenceError ? 503 : 500 }
    );
  }
}
