import { NextResponse } from 'next/server';
import { getAllCoursesAsync } from '@/lib/courses-store';
import { requireAdmin } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const courses = await getAllCoursesAsync({ includeUnpublished: true });
    const formatted = courses.map((c) => {
      let numericHours = 20;
      if (typeof c.duration === 'string') {
        const match = c.duration.match(/\d+/);
        if (match) numericHours = parseInt(match[0], 10);
      }

      let categoryLabel = 'تقنية وحاسب';
      const cat = String(c.category || '');
      if (cat === 'admin' || cat === 'office') categoryLabel = 'أعمال مكتبية';
      else if (cat === 'data') categoryLabel = 'إدخال بيانات';
      else if (cat === 'languages' || cat === 'english') categoryLabel = 'لغات';
      else if (cat === 'corporate' || cat === 'management' || cat === 'finance') categoryLabel = 'إدارة وأعمال';
      else if (cat === 'safety' || cat === 'osha' || cat === 'nebosh') categoryLabel = 'سلامة مهنية';
      else if (cat === 'qudurat' || cat === 'aptitude') categoryLabel = 'تأهيل واختبارات';
      else if (cat) categoryLabel = cat;

      return {
        id: String(c.id),
        slug: c.slug,
        title: c.title,
        category: categoryLabel,
        rawCategory: c.category,
        level: c.level,
        type: 'online',
        trainer: c.instructor || 'مدرب معتمد',
        price: c.price > 0 ? `${c.price.toLocaleString('en-US')} ر.س` : 'مجانية',
        rawPrice: c.price,
        students: c.enrollees ?? c.studentsCount ?? 0,
        lessonsCount: c.curriculum ? c.curriculum.length : (c.lessonsCount || 0),
        hours: numericHours,
        status: c.status || 'draft',
        description: c.description || '',
        curriculum: c.curriculum || [],
        attachments: c.attachments || [],
        finalExam: c.finalExam || undefined,
        professionalDevelopment: c.professionalDevelopment === true,
        learningJourney: c.learningJourney, outcomes: c.outcomes,
        image: c.image || '/logo.webp',
      };
    });

    return NextResponse.json(
      { success: true, courses: formatted },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Admin GET courses error:', err);
    return NextResponse.json({ success: false, error: 'تعذر تحميل الدورات' }, { status: 500 });
  }
}
