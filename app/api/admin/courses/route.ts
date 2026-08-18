import { NextResponse } from 'next/server';
import { getAllCourses, saveCourse, deleteCourse } from '@/lib/courses-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = getAllCourses();
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
        type: 'online',
        trainer: c.instructor || 'مدرب معتمد',
        price: c.price > 0 ? `${c.price.toLocaleString('en-US')} ر.س` : 'مجانية',
        rawPrice: c.price,
        students: c.enrollees || c.studentsCount || 100,
        lessonsCount: c.curriculum ? c.curriculum.length : (c.lessonsCount || 0),
        hours: numericHours,
        status: 'published',
        description: c.description || '',
        curriculum: c.curriculum || [],
        image: c.image || '/logo.webp',
      };
    });

    return NextResponse.json({ success: true, courses: formatted });
  } catch (err: any) {
    console.error('Admin GET courses error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: 'عنوان الدورة مطلوب' }, { status: 400 });
    }

    const saved = saveCourse(body);
    return NextResponse.json({ success: true, course: saved });
  } catch (err: any) {
    console.error('Admin POST course error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug') || searchParams.get('id');
    
    if (!slug) {
      return NextResponse.json({ success: false, error: 'معرّف الدورة مطلوب' }, { status: 400 });
    }

    const deleted = deleteCourse(slug);
    return NextResponse.json({ success: deleted });
  } catch (err: any) {
    console.error('Admin DELETE course error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
