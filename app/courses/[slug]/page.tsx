import { notFound } from "next/navigation";
import { getAllCoursesAsync } from "@/lib/courses-store";
import { findCourseByIdentifier, normalizeCourseIdentifier } from "@/lib/public-courses";
import { courses as bundledCourses, getCourseBySlug } from "@/data/courses";
import type { Course } from "@/types";
import CourseDetailClient from "./CourseDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function buildRelatedCourses(course: Course, liveCatalog: Course[]): Course[] {
  const merged = new Map<string, Course>();
  for (const item of [...bundledCourses, ...liveCatalog]) {
    merged.set(normalizeCourseIdentifier(item.slug || item.id), item);
  }

  return [...merged.values()]
    .filter((item) => item.id !== course.id && (item.category === course.category || item.featured))
    .slice(0, 3);
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const liveCatalog = await getAllCoursesAsync();
  const course = findCourseByIdentifier(liveCatalog, slug) || getCourseBySlug(slug);

  if (!course) notFound();

  return (
    <CourseDetailClient
      course={course}
      relatedCourses={buildRelatedCourses(course, liveCatalog)}
    />
  );
}
