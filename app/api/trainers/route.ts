import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { getAllCoursesAsync } from '@/lib/courses-store';

export async function GET() {
  const [profiles, courses] = await Promise.all([
    getSupabaseAdmin().from('profiles').select('*').in('role', ['INSTRUCTOR', 'TRAINER', 'TEACHER']).order('created_at'),
    getAllCoursesAsync(),
  ]);
  if (profiles.error) return NextResponse.json({ success: false, trainers: [] }, { status: 503 });
  const trainers = (profiles.data ?? []).filter(profile => profile.status !== 'suspended' && profile.status !== 'on_leave').map((profile, index) => {
    const assignedCourses = courses.filter(course => course.trainerId === profile.id);
    return {
      id: profile.id, name: profile.full_name, title: profile.specialty || 'تطوير مهني',
      description: profile.bio || 'تدريب تطبيقي على مهارات العمل والتواصل.',
      image: profile.avatar_url || '/demo/madar/avatar.svg', category: 'management', isFeatured: index === 0,
      courses: assignedCourses.map(course => ({ name: course.title, slug: course.slug })),
      features: ['دورات مهنية', 'تطبيقات عملية'],
    };
  });
  return NextResponse.json({ success: true, trainers });
}
