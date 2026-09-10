import { notFound } from "next/navigation";
import { getAllCoursesAsync } from "@/lib/courses-store";
import { findCourseByIdentifier } from "@/lib/public-courses";
import type { Course } from "@/types";
import CourseDetailClient from "./CourseDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildRelatedCourses(course: Course, liveCatalog: Course[]): Course[] {
  return liveCatalog
    .filter((item) => item.id !== course.id && (item.category === course.category || item.featured))
    .slice(0, 3);
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const liveCatalog = await getAllCoursesAsync();
  const course = findCourseByIdentifier(liveCatalog, slug);

  if (!course) notFound();

  return (
    <CourseDetailClient
      course={course}
      relatedCourses={buildRelatedCourses(course, liveCatalog)}
    />
  );
}
