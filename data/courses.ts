import type { Course } from '@/types';
import fixture from './courses-db.json';

export const courseCategories = [
  { key: 'all', label: 'كل التخصصات' },
  { key: 'management', label: 'الإدارة والقيادة' },
  { key: 'data', label: 'البيانات والتحليل' },
  { key: 'tech', label: 'التقنية والتصميم' },
];

export const demoCourses = fixture as Course[];
export const courses = demoCourses.filter((course) => course.status === 'published');

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}
