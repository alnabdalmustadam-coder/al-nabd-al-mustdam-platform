import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAllCoursesAsync } from '@/lib/courses-store';

export const dynamic = 'force-dynamic';

function getDefaultTrainerAvatar(name?: string, specialty?: string): string {
  const text = `${name || ''} ${specialty || ''}`.toLowerCase();
  const femalePatterns = [
    'أمال', 'ميسون', 'عهود', 'سارة', 'نورة', 'فاطمة', 'عائشة', 'منى', 
    'هند', 'مريم', 'ريم', 'هدى', 'سميرة', 'ابتسام', 'نجلاء', 'خلود',
    'المدربة', 'أستاذة', 'دكتورة', 'محامية', 'أخصائية', 'استشارية'
  ];
  const isFemale = femalePatterns.some((pat) => text.includes(pat));
  return isFemale ? '/trainer-default-female.webp' : '/trainer-default-male.webp';
}

const FEATURED_TRAINER_DETAILS: Record<string, { description: string; courses: string[]; category: string }> = {
  'عبد الرحمن المسعود': {
    description: 'حاصل على بكالوريوس الطب والجراحة والبورد السعودي في طب الباطني. يقدم برامج تدريبية تعتمد على خبرة عملية وتطبيقات واقعية، بمحتوى علمي محدث واحترافي.',
    courses: ['مهارات التواصل الفعّال', 'مهارات اتخاذ القرار', 'القيادة الإكلينيكية', 'إدارة الضغوط النفسية'],
    category: 'medical',
  },
  'عماد الجهني': {
    description: 'حاصل على ماجستير إدارة المستشفيات والخدمات الصحية، ودكتوراه في إدارة المستشفيات (أكاديمي). يقدم برامج تعتمد على خبرة عملية وتطبيقات واقعية بمحتوى علمي محدث واحترافي.',
    courses: ['الإدارات العليا', 'إدارة المستشفيات', 'مهارات القيادة المتقدمة', 'الإدارة المالية'],
    category: 'management',
  },
  'عهود ابو عطا الله': {
    description: 'حاصلة على ماجستير علم اجتماع (علاج أسري وأسري)، خبيرة في علم الاجتماع وتطوير المهارات، وتقدم استشارات اجتماعية وأسرية متخصصة.',
    courses: ['الذكاء العاطفي', 'تعزيز الصحة في بيئة العمل', 'العلاج السلوكي المعرفي', 'تطوير مهاراتي الاجتماعية'],
    category: 'languages',
  },
};

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch active trainers from profiles
    const { data: profiles, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, bio, specialty, avatar_url, role, status, created_at')
      .in('role', ['INSTRUCTOR', 'TRAINER', 'TEACHER'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Public trainers fetch error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Only active trainers
    const activeProfiles = (profiles || []).filter((p) => p.status !== 'suspended' && p.status !== 'on_leave');

    // Fetch published courses to link each trainer to their actual courses
    const allCourses = await getAllCoursesAsync({ includeUnpublished: false });

    const trainers = activeProfiles.map((p) => {
      const name = p.full_name?.trim() || 'مدرب معتمد';
      const specialty = p.bio || p.specialty || 'خبير ومحاضر تدريبي معتمد';

      // Check for featured poster details
      const matchedKey = Object.keys(FEATURED_TRAINER_DETAILS).find((k) => {
        if (name.includes(k)) return true;
        if (k === 'عماد الجهني' && name.includes('عماد') && name.includes('الجهني')) return true;
        if (k === 'عبد الرحمن المسعود' && name.includes('عبد الرحمن') && name.includes('المسعود')) return true;
        if (k === 'عهود ابو عطا الله' && (name.includes('عهود') || name.includes('عطا الله'))) return true;
        return false;
      });
      const featuredConfig = matchedKey ? FEATURED_TRAINER_DETAILS[matchedKey] : null;

      // Find matching published courses from database
      const assignedCourses = allCourses.filter(
        (c) =>
          (c.trainerId && String(c.trainerId) === String(p.id)) ||
          (c.instructor && c.instructor.trim() === name)
      );

      // Determine courses list (from DB or rich featured courses)
      let coursesList: { name: string; slug?: string }[] = [];
      if (assignedCourses.length > 0) {
        coursesList = assignedCourses.map((c) => ({ name: c.title, slug: c.slug }));
      } else if (featuredConfig) {
        coursesList = featuredConfig.courses.map((cName) => ({ name: cName }));
      }

      // Determine category
      let category = featuredConfig ? featuredConfig.category : 'management';
      if (!featuredConfig) {
        const textToCheck = (specialty + ' ' + coursesList.map((c) => c.name).join(' ')).toLowerCase();
        if (textToCheck.includes('طب') || textToCheck.includes('صحي') || textToCheck.includes('مستشف') || textToCheck.includes('تمريض') || textToCheck.includes('hazmat')) {
          category = 'medical';
        } else if (textToCheck.includes('تقني') || textToCheck.includes('حاسب') || textToCheck.includes('cyber') || textToCheck.includes('برمج') || textToCheck.includes('ذكاء')) {
          category = 'technology';
        } else if (textToCheck.includes('لغ') || textToCheck.includes('انجليز') || textToCheck.includes('اجتماع') || textToCheck.includes('نفس')) {
          category = 'languages';
        }
      }

      // Select clean image (custom avatar, poster image, or default Saudi avatar)
      const image = p.avatar_url || getDefaultTrainerAvatar(name, specialty);

      return {
        id: p.id,
        name,
        title: specialty,
        description:
          featuredConfig?.description ||
          `مدرب ومحاضر معتمد في منصة النبض المستدام. يقدم برامج تدريبية وتطبيقية معتمدة وفق أحدث المناهج والمعايير المهنية.`,
        image,
        courses: coursesList,
        features: ['أون لاين & حضوري', 'شهادات معتمدة'],
        category,
        isFeatured: Boolean(featuredConfig),
      };
    });

    // Sort so featured poster trainers appear first, followed by others
    trainers.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    return NextResponse.json({
      success: true,
      trainers,
    });
  } catch (err: any) {
    console.error('Public trainers API error:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
