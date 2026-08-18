import { redirect } from 'next/navigation';

interface LessonsPageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export default async function StudentCourseLessonsPage({ params }: LessonsPageProps) {
  const resolvedParams = await params;
  const courseSlug = resolvedParams.courseSlug || 'osha-course';

  redirect(`/dashboard/student/courses/${courseSlug}/lessons/lesson-1`);
}
