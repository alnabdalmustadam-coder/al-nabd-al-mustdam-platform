import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { lessonId, watchedSeconds, lastPositionSeconds, isCompleted } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: 'معرف الدرس مطلوب' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Intentionally ignored
            }
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    // Upsert lesson progress
    const { data: progressData, error: upsertError } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          watched_seconds: watchedSeconds || 0,
          last_position_seconds: lastPositionSeconds || 0,
          is_completed: isCompleted || false,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,lesson_id' }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Progress upsert error:', upsertError);
    }

    // Calculate total course progress
    const { data: lessonObj } = await supabase
      .from('lessons')
      .select('course_id')
      .eq('id', lessonId)
      .single();

    if (lessonObj?.course_id) {
      const { count: totalLessonsCount } = await supabase
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', lessonObj.course_id);

      const { count: completedLessonsCount } = await supabase
        .from('lesson_progress')
        .select('lessons!inner(course_id)', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .eq('lessons.course_id', lessonObj.course_id);

      const total = totalLessonsCount || 1;
      const completed = completedLessonsCount || 0;
      const percent = Math.min(100, Math.round((completed / total) * 100));

      await supabase
        .from('enrollments')
        .update({
          progress: percent,
        })
        .eq('email', user.email)
        .eq('course_id', lessonObj.course_id);
    }

    return NextResponse.json({ success: true, progress: progressData });
  } catch (err) {
    console.error('Error updating lesson progress:', err);
    return NextResponse.json({ error: 'خطأ أثناء تحديث الإنجاز' }, { status: 500 });
  }
}
