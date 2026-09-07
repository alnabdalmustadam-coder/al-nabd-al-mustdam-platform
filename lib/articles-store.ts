import 'server-only';

import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/observability/logger';
import { blogPosts, type BlogPost } from '@/data/blogPosts';

export class ArticlePersistenceError extends Error {
  constructor(message = 'تعذر حفظ المقال في قاعدة البيانات. يرجى التحقق من الاتصال وإعادة المحاولة.') {
    super(message);
    this.name = 'ArticlePersistenceError';
  }
}

export interface ArticleAuthor {
  name: string;
  role: string;
  avatar: string;
  bio?: string;
}

export interface ArticleSection {
  id?: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
}

export interface ArticleFaq {
  question: string;
  answer: string;
}

export interface ArticleItem {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  subtitle?: string;
  excerpt: string;
  content?: string;
  image: string;
  date?: string;
  isoDate?: string;
  readTime: string;
  category: string;
  categorySlug?: string;
  tags: string[];
  viewsCount: number;
  likesCount: number;
  status: 'published' | 'draft' | 'archived';
  is_featured: boolean;
  author: ArticleAuthor;
  keyTakeaways?: string[];
  tableOfContents?: { id: string; title: string }[];
  sections?: ArticleSection[];
  faqs?: ArticleFaq[];
  academicReferences?: string[];
  created_at?: string;
  updated_at?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function mapRowToArticle(row: any): ArticleItem {
  const p = row.payload || {};
  return {
    id: String(row.id),
    slug: row.slug,
    title: row.title,
    shortTitle: p.shortTitle || row.title,
    subtitle: p.subtitle || '',
    excerpt: p.excerpt || '',
    content: p.content || '',
    image: p.image || '/images/blog/pmp-management.jpg',
    date: p.date || (row.created_at ? new Date(row.created_at).toLocaleDateString('ar-SA') : ''),
    isoDate: p.isoDate || (row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : ''),
    readTime: p.readTime || '5 دقائق',
    category: p.category || 'عام',
    categorySlug: p.categorySlug || 'general',
    tags: Array.isArray(p.tags) ? p.tags : [],
    viewsCount: Number(p.viewsCount || 0),
    likesCount: Number(p.likesCount || 0),
    status: (row.status as 'published' | 'draft' | 'archived') || 'draft',
    is_featured: Boolean(row.is_featured),
    author: {
      name: p.author?.name || 'فريق التحرير',
      role: p.author?.role || 'مستشار المحتوى الأكاديمي',
      avatar: p.author?.avatar || '/logo.webp',
      bio: p.author?.bio || '',
    },
    keyTakeaways: Array.isArray(p.keyTakeaways) ? p.keyTakeaways : [],
    tableOfContents: Array.isArray(p.tableOfContents) ? p.tableOfContents : [],
    sections: Array.isArray(p.sections) ? p.sections : [],
    faqs: Array.isArray(p.faqs) ? p.faqs : [],
    academicReferences: Array.isArray(p.academicReferences) ? p.academicReferences : [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Automatically seed blogPosts into admin_content_items on initial setup if table is empty.
 */
let isSeeded = false;
export async function seedArticlesIfEmpty(): Promise<void> {
  if (isSeeded) return;
  try {
    const admin = getSupabaseAdmin();
    const { count, error } = await admin
      .from('admin_content_items')
      .select('*', { count: 'exact', head: true })
      .eq('kind', 'article');

    if (error) {
      logger.warn('articles.seed_check_failed', { error });
      return;
    }

    if ((count ?? 0) === 0 && blogPosts.length > 0) {
      const rows = blogPosts.map((post) => ({
        kind: 'article',
        slug: post.slug,
        title: post.title,
        status: 'published',
        is_featured: post.id === 1 || post.id === 2,
        payload: {
          shortTitle: post.shortTitle,
          subtitle: post.subtitle,
          excerpt: post.excerpt,
          content: post.sections?.map(s => s.paragraphs?.join('\n\n')).join('\n\n') || '',
          image: post.image,
          date: post.date,
          isoDate: post.isoDate,
          readTime: post.readTime,
          category: post.category,
          categorySlug: post.categorySlug,
          tags: post.tags,
          viewsCount: post.viewsCount,
          likesCount: post.likesCount,
          author: post.author,
          keyTakeaways: post.keyTakeaways,
          tableOfContents: post.tableOfContents,
          sections: post.sections,
          faqs: post.faqs,
          academicReferences: post.academicReferences,
        },
      }));

      const { error: insertError } = await admin.from('admin_content_items').insert(rows);
      if (insertError) {
        logger.warn('articles.seed_insert_failed', { insertError });
      } else {
        logger.info('articles.seeded_supabase', { count: rows.length });
      }
    }
    isSeeded = true;
  } catch (err) {
    logger.warn('articles.seed_exception', { err });
  }
}

/**
 * Get all articles from Supabase admin_content_items
 */
export async function getAllArticlesAsync(options?: {
  includeDrafts?: boolean;
  category?: string;
  tag?: string;
  search?: string;
}): Promise<ArticleItem[]> {
  await seedArticlesIfEmpty();

  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from('admin_content_items')
      .select('*')
      .eq('kind', 'article')
      .order('created_at', { ascending: false });

    if (!options?.includeDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query;

    if (error) {
      logger.error('articles.fetch_all_failed', { error });
      // Fallback to static blogPosts for public read if DB fails
      return blogPosts.map((p) => ({
        id: String(p.id),
        slug: p.slug,
        title: p.title,
        shortTitle: p.shortTitle,
        subtitle: p.subtitle,
        excerpt: p.excerpt,
        image: p.image,
        date: p.date,
        isoDate: p.isoDate,
        readTime: p.readTime,
        category: p.category,
        categorySlug: p.categorySlug,
        tags: p.tags,
        viewsCount: p.viewsCount,
        likesCount: p.likesCount,
        status: 'published',
        is_featured: p.id === 1,
        author: p.author,
        keyTakeaways: p.keyTakeaways,
        tableOfContents: p.tableOfContents,
        sections: p.sections,
        faqs: p.faqs,
        academicReferences: p.academicReferences,
      }));
    }

    let results = (data || []).map(mapRowToArticle);

    if (options?.category && options.category !== 'all') {
      results = results.filter(
        (a) => a.category === options.category || a.categorySlug === options.category
      );
    }

    if (options?.tag) {
      results = results.filter((a) => a.tags.includes(options.tag!));
    }

    if (options?.search) {
      const q = options.search.toLowerCase().trim();
      results = results.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    return results;
  } catch (err) {
    logger.error('articles.fetch_exception', { err });
    return [];
  }
}

/**
 * Get article by slug
 */
export async function getArticleBySlugAsync(
  slug: string,
  options?: { includeDrafts?: boolean }
): Promise<ArticleItem | null> {
  await seedArticlesIfEmpty();

  const cleanSlug = slug.trim().toLowerCase();
  try {
    const admin = getSupabaseAdmin();
    let query = admin
      .from('admin_content_items')
      .select('*')
      .eq('kind', 'article')
      .eq('slug', cleanSlug);

    if (!options?.includeDrafts) {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error('articles.get_by_slug_failed', { error, slug });
    }

    if (data) {
      return mapRowToArticle(data);
    }

    // Fallback to static blogPosts
    const fallback = blogPosts.find((p) => p.slug === cleanSlug);
    if (fallback) {
      return {
        id: String(fallback.id),
        slug: fallback.slug,
        title: fallback.title,
        shortTitle: fallback.shortTitle,
        subtitle: fallback.subtitle,
        excerpt: fallback.excerpt,
        image: fallback.image,
        date: fallback.date,
        isoDate: fallback.isoDate,
        readTime: fallback.readTime,
        category: fallback.category,
        categorySlug: fallback.categorySlug,
        tags: fallback.tags,
        viewsCount: fallback.viewsCount,
        likesCount: fallback.likesCount,
        status: 'published',
        is_featured: fallback.id === 1,
        author: fallback.author,
        keyTakeaways: fallback.keyTakeaways,
        tableOfContents: fallback.tableOfContents,
        sections: fallback.sections,
        faqs: fallback.faqs,
        academicReferences: fallback.academicReferences,
      };
    }

    return null;
  } catch (err) {
    logger.error('articles.get_slug_exception', { err });
    return null;
  }
}

/**
 * Save article (Create or Update) in Supabase. Throws ArticlePersistenceError on failure.
 */
export async function saveArticleAsync(
  articleData: Partial<ArticleItem> & { title: string },
  actorId?: string
): Promise<ArticleItem> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  let targetSlug = articleData.slug ? slugify(articleData.slug) : slugify(articleData.title);
  if (!targetSlug) {
    targetSlug = `article-${Date.now()}`;
  }

  const payload = {
    shortTitle: articleData.shortTitle || articleData.title,
    subtitle: articleData.subtitle || '',
    excerpt: articleData.excerpt || '',
    content: articleData.content || '',
    image: articleData.image || '/images/blog/pmp-management.jpg',
    date: articleData.date || new Date().toLocaleDateString('ar-SA'),
    isoDate: articleData.isoDate || now.split('T')[0],
    readTime: articleData.readTime || '5 دقائق',
    category: articleData.category || 'عام',
    categorySlug: articleData.categorySlug || slugify(articleData.category || 'general'),
    tags: Array.isArray(articleData.tags) ? articleData.tags : [],
    viewsCount: Number(articleData.viewsCount || 0),
    likesCount: Number(articleData.likesCount || 0),
    author: {
      name: articleData.author?.name || 'فريق التحرير',
      role: articleData.author?.role || 'مستشار المحتوى الأكاديمي',
      avatar: articleData.author?.avatar || '/logo.webp',
      bio: articleData.author?.bio || '',
    },
    keyTakeaways: Array.isArray(articleData.keyTakeaways) ? articleData.keyTakeaways : [],
    tableOfContents: Array.isArray(articleData.tableOfContents) ? articleData.tableOfContents : [],
    sections: Array.isArray(articleData.sections) ? articleData.sections : [],
    faqs: Array.isArray(articleData.faqs) ? articleData.faqs : [],
    academicReferences: Array.isArray(articleData.academicReferences) ? articleData.academicReferences : [],
  };

  const isUuid = Boolean(
    articleData.id &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(articleData.id)
  );

  let existingItem: any = null;

  if (isUuid) {
    const { data, error } = await admin
      .from('admin_content_items')
      .select('*')
      .eq('id', articleData.id)
      .eq('kind', 'article')
      .maybeSingle();
    if (!error && data) existingItem = data;
  }

  if (!existingItem && targetSlug) {
    const { data, error } = await admin
      .from('admin_content_items')
      .select('*')
      .eq('kind', 'article')
      .eq('slug', targetSlug)
      .maybeSingle();
    if (!error && data) existingItem = data;
  }

  if (existingItem) {
    // Update existing record
    const { data: updated, error: updateError } = await admin
      .from('admin_content_items')
      .update({
        title: articleData.title.trim(),
        slug: targetSlug,
        status: articleData.status || existingItem.status || 'draft',
        is_featured: articleData.is_featured !== undefined ? articleData.is_featured : existingItem.is_featured,
        payload: { ...(existingItem.payload || {}), ...payload },
        updated_by: actorId || null,
        updated_at: now,
      })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (updateError || !updated) {
      logger.error('articles.update_failed', { error: updateError });
      throw new ArticlePersistenceError('فشل تحديث المقال في قاعدة البيانات: ' + (updateError?.message || 'خطأ غير معروف'));
    }

    return mapRowToArticle(updated);
  } else {
    // Insert new record
    const { data: inserted, error: insertError } = await admin
      .from('admin_content_items')
      .insert({
        kind: 'article',
        slug: targetSlug,
        title: articleData.title.trim(),
        status: articleData.status || 'draft',
        is_featured: Boolean(articleData.is_featured),
        payload,
        created_by: actorId || null,
        updated_by: actorId || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();

    if (insertError || !inserted) {
      logger.error('articles.insert_failed', { error: insertError });
      throw new ArticlePersistenceError('فشل حفظ المقال الجديد في قاعدة البيانات: ' + (insertError?.message || 'خطأ غير معروف'));
    }

    return mapRowToArticle(inserted);
  }
}

/**
 * Toggle article status
 */
export async function toggleArticleStatusAsync(
  idOrSlug: string,
  status: 'published' | 'draft' | 'archived',
  actorId?: string
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  let query = admin
    .from('admin_content_items')
    .update({ status, updated_at: new Date().toISOString(), updated_by: actorId || null });

  query = isUuid ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);
  const { error } = await query.eq('kind', 'article');

  if (error) {
    logger.error('articles.toggle_status_failed', { error, idOrSlug });
    throw new ArticlePersistenceError('فشل تغيير حالة المقال');
  }

  return true;
}

/**
 * Toggle article featured status
 */
export async function toggleArticleFeaturedAsync(
  idOrSlug: string,
  isFeatured: boolean,
  actorId?: string
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  let query = admin
    .from('admin_content_items')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString(), updated_by: actorId || null });

  query = isUuid ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);
  const { error } = await query.eq('kind', 'article');

  if (error) {
    logger.error('articles.toggle_featured_failed', { error, idOrSlug });
    throw new ArticlePersistenceError('فشل تغيير تمييز المقال');
  }

  return true;
}

/**
 * Delete an article from Supabase
 */
export async function deleteArticleAsync(idOrSlug: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

  let query = admin.from('admin_content_items').delete().eq('kind', 'article');
  query = isUuid ? query.eq('id', idOrSlug) : query.eq('slug', idOrSlug);

  const { error } = await query;
  if (error) {
    logger.error('articles.delete_failed', { error, idOrSlug });
    throw new ArticlePersistenceError('فشل حذف المقال من قاعدة البيانات: ' + error.message);
  }

  return true;
}

/**
 * Get statistics for articles
 */
export async function getArticlesStatsAsync(): Promise<{
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalLikes: number;
}> {
  const articles = await getAllArticlesAsync({ includeDrafts: true });
  const published = articles.filter((a) => a.status === 'published');
  const totalViews = articles.reduce((sum, a) => sum + (a.viewsCount || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.likesCount || 0), 0);

  return {
    totalArticles: articles.length,
    publishedArticles: published.length,
    totalViews,
    totalLikes,
  };
}
