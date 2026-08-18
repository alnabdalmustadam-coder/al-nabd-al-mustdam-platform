import fs from 'fs';
import path from 'path';
import { Course } from '@/types';
import { INITIAL_9_COURSES } from '@/data/courses';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'courses-db.json');

// Helper to ensure database file exists
function ensureDbFile(): Course[] {
  try {
    if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
    }

    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_9_COURSES, null, 2), 'utf-8');
      return INITIAL_9_COURSES;
    }

    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_9_COURSES;
  } catch (err) {
    console.error('Error reading courses db:', err);
    return INITIAL_9_COURSES;
  }
}

// Write back to DB
function writeDbFile(courses: Course[]): boolean {
  try {
    if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(courses, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing courses db:', err);
    return false;
  }
}

export function getAllCourses(): Course[] {
  return ensureDbFile();
}

export function getCourseBySlug(slugOrId?: string): Course | undefined {
  if (!slugOrId) return undefined;
  const clean = slugOrId.replace(/^course-/, '').toLowerCase().trim();
  const all = getAllCourses();

  return all.find((c) => {
    const cSlug = (c.slug || '').toLowerCase().trim();
    const cGhl = (c.ghlCourseId || '').replace(/^course-/, '').toLowerCase().trim();
    return (
      cSlug === clean ||
      cSlug === slugOrId.toLowerCase().trim() ||
      cGhl === clean ||
      (c.ghlCourseId && c.ghlCourseId.toLowerCase() === slugOrId.toLowerCase()) ||
      String(c.id) === clean ||
      (c.title && (c.title === slugOrId || slugOrId.includes(c.title) || c.title.includes(slugOrId)))
    );
  });
}

export function saveCourse(courseData: Partial<Course> & { title: string }): Course {
  const all = getAllCourses();
  
  // Generate slug if not present
  const baseSlug = courseData.slug 
    ? courseData.slug.trim().toLowerCase().replace(/\s+/g, '-')
    : `course-${Date.now()}`;

  const existingIndex = all.findIndex(
    (c) =>
      (courseData.id && (c.id === Number(courseData.id) || String(c.id) === String(courseData.id))) ||
      (courseData.slug && (c.slug === courseData.slug || c.slug.toLowerCase().trim() === courseData.slug.toLowerCase().trim()))
  );

  let updatedCourse: Course;

  if (existingIndex >= 0) {
    // Update existing course
    const existing = all[existingIndex];
    updatedCourse = {
      ...existing,
      ...courseData,
      id: existing.id,
      slug: courseData.slug || existing.slug,
      image: courseData.image || existing.image || '/logo.webp',
      instructor: courseData.instructor || existing.instructor || 'مدرب معتمد',
      category: courseData.category || existing.category || 'tech',
      level: courseData.level || existing.level || 'all',
      price: typeof courseData.price === 'number' ? courseData.price : (existing.price || 0),
      duration: courseData.duration || existing.duration || '20 ساعة',
      description: courseData.description || existing.description || '',
      curriculum: courseData.curriculum || existing.curriculum || [],
      outcomes: courseData.outcomes || existing.outcomes || [],
    };
    all[existingIndex] = updatedCourse;
  } else {
    // Create new course
    const nextId = all.length > 0 ? Math.max(...all.map((c) => Number(c.id) || 0)) + 1 : 1;
    updatedCourse = {
      id: nextId,
      slug: baseSlug,
      title: courseData.title,
      description: courseData.description || 'برنامج تدريبي معتمد وشامل.',
      category: courseData.category || 'tech',
      level: courseData.level || 'all',
      price: typeof courseData.price === 'number' ? courseData.price : 0,
      rating: courseData.rating || 5.0,
      enrollees: courseData.enrollees || 0,
      duration: courseData.duration || '20 ساعة',
      lessonsCount: courseData.curriculum ? courseData.curriculum.length : (courseData.lessonsCount || 0),
      featured: courseData.featured ?? true,
      image: courseData.image || '/logo.webp',
      instructor: courseData.instructor || 'مدرب معتمد',
      trainerId: courseData.trainerId || 'tr-1',
      curriculum: courseData.curriculum || [
        {
          id: `sec-1`,
          title: 'الوحدة الأولى: مدخل ومقدمة عامة',
          duration: '30 دقيقة',
          isLocked: false,
          type: 'video',
          videoUrl: 'MmHWTPJMzbQ',
          lessons: ['مقدمة تمهيدية وأهداف البرنامج']
        }
      ],
      outcomes: courseData.outcomes || ['اكتساب المعارف والمهارات الأساسية للمسار.'],
      requirements: courseData.requirements || 'لا توجد متطلبات مسبقة.',
      ghlCheckoutUrl: courseData.ghlCheckoutUrl || `/checkout?slug=${baseSlug}`,
      ghlCourseId: courseData.ghlCourseId || `course-${baseSlug}`,
    };
    all.push(updatedCourse);
  }

  writeDbFile(all);
  return updatedCourse;
}

export function deleteCourse(slugOrId: string | number): boolean {
  const all = getAllCourses();
  const clean = String(slugOrId).replace(/^course-/, '').toLowerCase().trim();
  
  const filtered = all.filter(
    (c) => String(c.id) !== clean && c.slug.toLowerCase().trim() !== clean
  );

  if (filtered.length !== all.length) {
    writeDbFile(filtered);
    return true;
  }
  return false;
}

export function addOrUpdateLesson(
  courseSlug: string,
  lessonData: {
    id?: string;
    title: string;
    duration?: string;
    videoUrl: string;
    type?: string;
    isLocked?: boolean;
    subLessons?: string[];
  }
): Course | null {
  const all = getAllCourses();
  const course = getCourseBySlug(courseSlug);
  if (!course) return null;

  const courseIndex = all.findIndex((c) => c.slug === course.slug);
  if (courseIndex === -1) return null;

  const curr = [...(course.curriculum || [])];
  const lessonId = lessonData.id || `les-${Date.now()}`;
  const existingLessonIndex = curr.findIndex((l) => l.id === lessonId);

  const newSection = {
    id: lessonId,
    title: lessonData.title,
    duration: lessonData.duration || '20 دقيقة',
    isLocked: lessonData.isLocked ?? false,
    type: lessonData.type || 'video',
    videoUrl: lessonData.videoUrl,
    lessons: lessonData.subLessons && lessonData.subLessons.length > 0 ? lessonData.subLessons : [lessonData.title],
  };

  if (existingLessonIndex >= 0) {
    curr[existingLessonIndex] = newSection;
  } else {
    curr.push(newSection);
  }

  course.curriculum = curr;
  course.lessonsCount = curr.length;
  all[courseIndex] = course;

  writeDbFile(all);
  return course;
}

export function deleteLesson(courseSlug: string, lessonId: string): Course | null {
  const all = getAllCourses();
  const course = getCourseBySlug(courseSlug);
  if (!course) return null;

  const courseIndex = all.findIndex((c) => c.slug === course.slug);
  if (courseIndex === -1) return null;

  const curr = (course.curriculum || []).filter((l) => l.id !== lessonId);
  course.curriculum = curr;
  course.lessonsCount = curr.length;
  all[courseIndex] = course;

  writeDbFile(all);
  return course;
}
