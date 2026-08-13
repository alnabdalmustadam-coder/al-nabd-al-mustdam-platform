import { redirect } from 'next/navigation';

interface CoursePageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export default async function StudentCourseSlugPage({ params }: CoursePageProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams.courseSlug || 'diploma-tolerance-citizenship';

  redirect(`/dashboard/student/courses/${courseSlug}/lessons/lesson-1`);
}
