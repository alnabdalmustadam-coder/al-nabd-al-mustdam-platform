import Link from 'next/link';
import { GraduationCap, PlayCircle } from 'lucide-react';
import { CardImage } from '@/components/ui/CardImage';

interface StudentCourseCardProps {
  course: {
    slug: string;
    title: string;
    instructor: string;
    thumbnailUrl: string;
    lessonsCount: number;
    completedLessons?: number;
    progressPercent: number;
  };
  featured?: boolean;
}

export function StudentCourseCard({ course, featured = false }: StudentCourseCardProps) {
  const completedLessons = course.completedLessons ?? Math.round((course.progressPercent / 100) * course.lessonsCount);
  const actionLabel = course.progressPercent >= 100
    ? 'مراجعة الدروس (مكتمل)'
    : course.progressPercent > 0
      ? 'متابعة الدراسة (دخول المشغل)'
      : 'بدء المساق الآن';

  return (
    <article className={`group relative h-full min-w-0 gap-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-5 shadow-xs transition-shadow duration-300 hover:shadow-xl sm:rounded-3xl ${featured ? 'grid md:grid-cols-2 md:items-center md:gap-6' : 'flex flex-col'}`}>
      <div className="relative min-w-0 overflow-hidden rounded-2xl border border-slate-100/90 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 transition-colors group-hover:border-blue-100">
        <CardImage
          src={course.thumbnailUrl || '/logo.webp'}
          alt={course.title}
          sizes={featured
            ? '(max-width: 767px) 100vw, 50vw'
            : '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw'}
        />

        <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2 text-[11px] font-black">
          <span className="rounded-full border border-blue-100/80 bg-white/90 px-3 py-1 text-[#173A7C] shadow-xs backdrop-blur-md">
            {completedLessons} من {course.lessonsCount} درس
          </span>
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-white shadow-xs backdrop-blur-md">
            مكتمل: %{course.progressPercent}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-base font-black leading-snug text-slate-900 transition-colors group-hover:text-[#173A7C]">
            {course.title}
          </h3>
          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <GraduationCap aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#173A7C]" />
            <span className="min-w-0 break-words">{course.instructor}</span>
          </p>
        </div>

        <div className="space-y-3.5 border-t border-slate-100 pt-4">
          <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="text-slate-700">مستوى الإنجاز</span>
              <span className="text-[#173A7C]">%{course.progressPercent}</span>
            </div>
            <div
              role="progressbar"
              aria-label={`مستوى إنجاز ${course.title}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={course.progressPercent}
              className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] transition-all duration-500 motion-reduce:transition-none"
                style={{ width: `${course.progressPercent}%` }}
              />
            </div>
          </div>

          <Link
            href={`/dashboard/student/courses/${course.slug}/lessons/lesson-1`}
            aria-label={`${actionLabel}: ${course.title}`}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] px-4 py-2.5 text-center text-xs font-black text-white shadow-xs transition-all duration-300 hover:from-[#1E4D9D] hover:to-[#2A65C7] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#173A7C] active:scale-98"
          >
            <PlayCircle aria-hidden="true" className="h-4 w-4 shrink-0 text-emerald-300" />
            <span>{actionLabel}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
