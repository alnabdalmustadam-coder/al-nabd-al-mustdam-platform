import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { Course } from '@/types';
import { INITIAL_9_COURSES } from '@/data/courses';

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'courses-db.json');
const SUPABASE_BUCKET = 'platform-data';
const SUPABASE_FILE = 'courses.json';

const SUPABASE_URL =
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://twsuffnjnayvcqovojmx.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3c3VmZm5qbmF5dmNxb3Zvam14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjExMzEyOCwiZXhwIjoyMDkxNjg5MTI4fQ.I42PxnKpuTnBBEpCNMHPBtBM1bNBPBv_Z4LMu_Y9E_A';

// Initialize Supabase Client with Service Key for full backend access
function getSupabaseClient() {
  try {
    return createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
  } catch (err) {
    console.error('Error creating Supabase client in courses-store:', err);
    return null;
  }
}

// In-memory cache
let memoryCache: Course[] | null = null;
let lastCloudFetchTime = 0;
const CACHE_TTL_MS = 15000; // 15 seconds cache

// Helper to ensure database file exists and load initial data
function loadInitialCourses(): Course[] {
  if (memoryCache && memoryCache.length > 0) {
    return memoryCache;
  }

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not read local courses-db.json, using INITIAL_9_COURSES:', err);
  }

  memoryCache = INITIAL_9_COURSES;
  return INITIAL_9_COURSES;
}

// Helper to safely write to local disk (won't throw on Vercel read-only system)
function writeLocalDbFile(courses: Course[]): boolean {
  try {
    if (!fs.existsSync(path.dirname(DB_FILE_PATH))) {
      fs.mkdirSync(path.dirname(DB_FILE_PATH), { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(courses, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Vercel serverless filesystem is read-only, which is completely normal
    return false;
  }
}

// Asynchronously fetch courses from Supabase Cloud Storage
export async function fetchCoursesFromCloud(): Promise<Course[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return loadInitialCourses();

    const { data, error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .download(SUPABASE_FILE);

    if (error || !data) {
      // If file doesn't exist yet in bucket, upload current initial courses
      const initial = loadInitialCourses();
      await uploadCoursesToCloud(initial).catch(() => {});
      return initial;
    }

    const text = await data.text();
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryCache = parsed;
      lastCloudFetchTime = Date.now();
      writeLocalDbFile(parsed);
      return parsed;
    }
  } catch (err) {
    console.error('Error fetching courses from Supabase Storage:', err);
  }

  return loadInitialCourses();
}

// Asynchronously upload courses to Supabase Cloud Storage
export async function uploadCoursesToCloud(courses: Course[]): Promise<boolean> {
  memoryCache = courses;
  writeLocalDbFile(courses);

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;

    const payload = JSON.stringify(courses, null, 2);
    const { error } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(SUPABASE_FILE, Buffer.from(payload, 'utf-8'), {
        contentType: 'application/json',
        upsert: true,
      });

    if (error) {
      console.error('Failed to upload courses to Supabase Storage:', error);
      return false;
    }

    lastCloudFetchTime = Date.now();
    return true;
  } catch (err) {
    console.error('Error uploading courses to cloud storage:', err);
    return false;
  }
}

// Synchronous GetAll (uses cache / local file)
export function getAllCourses(): Course[] {
  return memoryCache && memoryCache.length > 0 ? memoryCache : loadInitialCourses();
}

// Asynchronous GetAll (fetches latest from Supabase Cloud Storage)
export async function getAllCoursesAsync(): Promise<Course[]> {
  const now = Date.now();
  if (memoryCache && memoryCache.length > 0 && now - lastCloudFetchTime < CACHE_TTL_MS) {
    return memoryCache;
  }
  return await fetchCoursesFromCloud();
}

// Find course by Slug or ID (Sync)
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

// Find course by Slug or ID (Async)
export async function getCourseBySlugAsync(slugOrId?: string): Promise<Course | undefined> {
  if (!slugOrId) return undefined;
  const all = await getAllCoursesAsync();
  const clean = slugOrId.replace(/^course-/, '').toLowerCase().trim();

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

// Save or Update a Course (Async)
export async function saveCourseAsync(courseData: Partial<Course> & { title: string }): Promise<Course> {
  const all = await getAllCoursesAsync();

  // Generate slug if not present
  let baseSlug = courseData.slug ? courseData.slug.trim().toLowerCase().replace(/[\s_]+/g, '-') : '';
  if (!baseSlug) {
    const safeTitle = courseData.title
      .replace(/[^\w\s\u0600-\u06FF-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-');
    baseSlug = safeTitle ? `${safeTitle}-${Date.now().toString().slice(-4)}` : `course-${Date.now()}`;
  }

  const existingIndex = all.findIndex(
    (c) =>
      (courseData.id && (c.id === Number(courseData.id) || String(c.id) === String(courseData.id))) ||
      (courseData.slug && (c.slug === courseData.slug || c.slug.toLowerCase().trim() === courseData.slug.toLowerCase().trim())) ||
      (c.slug === baseSlug)
  );

  let updatedCourse: Course;

  const curriculum = Array.isArray(courseData.curriculum) && courseData.curriculum.length > 0
    ? courseData.curriculum
    : [
      {
        id: `sec-1`,
        title: 'الوحدة الأولى: مدخل ومقدمة عامة',
        duration: '30 دقيقة',
        isLocked: false,
        type: 'video',
        videoUrl: 'MmHWTPJMzbQ',
        lessons: ['مقدمة تمهيدية وأهداف البرنامج'],
      },
    ];

  if (existingIndex >= 0) {
    // Update existing course
    const existing = all[existingIndex];
    updatedCourse = {
      ...existing,
      ...courseData,
      id: existing.id,
      slug: courseData.slug || existing.slug || baseSlug,
      title: courseData.title || existing.title,
      image: courseData.image || existing.image || '/logo.webp',
      instructor: courseData.instructor || existing.instructor || 'مدرب معتمد',
      category: courseData.category || existing.category || 'tech',
      level: courseData.level || existing.level || 'all',
      price: typeof courseData.price === 'number' ? courseData.price : (existing.price || 0),
      duration: courseData.duration || existing.duration || '20 ساعة',
      description: courseData.description || existing.description || '',
      curriculum: courseData.curriculum !== undefined ? courseData.curriculum : (existing.curriculum || curriculum),
      lessonsCount: courseData.curriculum !== undefined ? courseData.curriculum.length : (existing.curriculum ? existing.curriculum.length : (existing.lessonsCount || curriculum.length)),
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
      lessonsCount: curriculum.length,
      featured: courseData.featured ?? true,
      image: courseData.image || '/logo.webp',
      instructor: courseData.instructor || 'مدرب معتمد',
      trainerId: courseData.trainerId || 'tr-1',
      curriculum: curriculum,
      outcomes: courseData.outcomes || ['اكتساب المعارف والمهارات الأساسية للمسار.'],
      requirements: courseData.requirements || 'لا توجد متطلبات مسبقة.',
      ghlCheckoutUrl: courseData.ghlCheckoutUrl || `/checkout?slug=${baseSlug}`,
      ghlCourseId: courseData.ghlCourseId || `course-${baseSlug}`,
    };
    all.unshift(updatedCourse);
  }

  await uploadCoursesToCloud(all);
  return updatedCourse;
}

// Synchronous wrapper for saveCourse
export function saveCourse(courseData: Partial<Course> & { title: string }): Course {
  const all = getAllCourses();
  let baseSlug = courseData.slug ? courseData.slug.trim().toLowerCase().replace(/[\s_]+/g, '-') : '';
  if (!baseSlug) {
    const safeTitle = courseData.title
      .replace(/[^\w\s\u0600-\u06FF-]/g, '')
      .trim()
      .replace(/[\s_]+/g, '-');
    baseSlug = safeTitle ? `${safeTitle}-${Date.now().toString().slice(-4)}` : `course-${Date.now()}`;
  }

  const existingIndex = all.findIndex(
    (c) =>
      (courseData.id && (c.id === Number(courseData.id) || String(c.id) === String(courseData.id))) ||
      (courseData.slug && (c.slug === courseData.slug || c.slug.toLowerCase().trim() === courseData.slug.toLowerCase().trim())) ||
      (c.slug === baseSlug)
  );

  let updatedCourse: Course;
  const curriculum = Array.isArray(courseData.curriculum) && courseData.curriculum.length > 0
    ? courseData.curriculum
    : [
      {
        id: `sec-1`,
        title: 'الوحدة الأولى: مدخل ومقدمة عامة',
        duration: '30 دقيقة',
        isLocked: false,
        type: 'video',
        videoUrl: 'MmHWTPJMzbQ',
        lessons: ['مقدمة تمهيدية وأهداف البرنامج'],
      },
    ];

  if (existingIndex >= 0) {
    const existing = all[existingIndex];
    updatedCourse = {
      ...existing,
      ...courseData,
      id: existing.id,
      slug: courseData.slug || existing.slug || baseSlug,
      title: courseData.title || existing.title,
      image: courseData.image || existing.image || '/logo.webp',
      instructor: courseData.instructor || existing.instructor || 'مدرب معتمد',
      category: courseData.category || existing.category || 'tech',
      level: courseData.level || existing.level || 'all',
      price: typeof courseData.price === 'number' ? courseData.price : (existing.price || 0),
      duration: courseData.duration || existing.duration || '20 ساعة',
      description: courseData.description || existing.description || '',
      curriculum: courseData.curriculum !== undefined ? courseData.curriculum : (existing.curriculum || curriculum),
      lessonsCount: courseData.curriculum !== undefined ? courseData.curriculum.length : (existing.curriculum ? existing.curriculum.length : (existing.lessonsCount || curriculum.length)),
      outcomes: courseData.outcomes || existing.outcomes || [],
    };
    all[existingIndex] = updatedCourse;
  } else {
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
      lessonsCount: curriculum.length,
      featured: courseData.featured ?? true,
      image: courseData.image || '/logo.webp',
      instructor: courseData.instructor || 'مدرب معتمد',
      trainerId: courseData.trainerId || 'tr-1',
      curriculum: curriculum,
      outcomes: courseData.outcomes || ['اكتساب المعارف والمهارات الأساسية للمسار.'],
      requirements: courseData.requirements || 'لا توجد متطلبات مسبقة.',
      ghlCheckoutUrl: courseData.ghlCheckoutUrl || `/checkout?slug=${baseSlug}`,
      ghlCourseId: courseData.ghlCourseId || `course-${baseSlug}`,
    };
    all.unshift(updatedCourse);
  }

  // Trigger cloud upload in background
  uploadCoursesToCloud(all).catch(console.error);
  return updatedCourse;
}

// Delete Course (Async)
export async function deleteCourseAsync(slugOrId: string | number): Promise<boolean> {
  const all = await getAllCoursesAsync();
  const clean = String(slugOrId).replace(/^course-/, '').toLowerCase().trim();

  const filtered = all.filter(
    (c) => String(c.id) !== clean && c.slug.toLowerCase().trim() !== clean
  );

  if (filtered.length !== all.length) {
    await uploadCoursesToCloud(filtered);
    return true;
  }
  return false;
}

// Delete Course (Sync wrapper)
export function deleteCourse(slugOrId: string | number): boolean {
  const all = getAllCourses();
  const clean = String(slugOrId).replace(/^course-/, '').toLowerCase().trim();

  const filtered = all.filter(
    (c) => String(c.id) !== clean && c.slug.toLowerCase().trim() !== clean
  );

  if (filtered.length !== all.length) {
    uploadCoursesToCloud(filtered).catch(console.error);
    return true;
  }
  return false;
}

// Add or Update Lesson (Async)
export async function addOrUpdateLessonAsync(
  courseSlug: string,
  lessonData: {
    id?: string;
    title: string;
    duration?: string;
    videoUrl?: string;
    type?: string;
    isLocked?: boolean;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    quizData?: any;
    items?: any[];
    subLessons?: string[];
  }
): Promise<Course | null> {
  const all = await getAllCoursesAsync();
  const course = await getCourseBySlugAsync(courseSlug);
  if (!course) return null;

  const courseIndex = all.findIndex((c) => c.slug === course.slug);
  if (courseIndex === -1) return null;

  const curr = [...(course.curriculum || [])];
  const lessonId = lessonData.id || `les-${Date.now()}`;
  const existingLessonIndex = curr.findIndex((l) => l.id === lessonId);

  const newSection: any = {
    id: lessonId,
    title: lessonData.title,
    duration: lessonData.duration || '20 دقيقة',
    isLocked: lessonData.isLocked ?? false,
    type: lessonData.type || 'video',
    videoUrl: lessonData.videoUrl || '',
    fileUrl: lessonData.fileUrl,
    fileName: lessonData.fileName,
    fileSize: lessonData.fileSize,
    quizData: lessonData.quizData,
    items: lessonData.items,
    lessons: lessonData.subLessons && lessonData.subLessons.length > 0 ? lessonData.subLessons : [lessonData.title],
  };

  if (existingLessonIndex >= 0) {
    curr[existingLessonIndex] = { ...curr[existingLessonIndex], ...newSection };
  } else {
    curr.push(newSection);
  }

  course.curriculum = curr;
  course.lessonsCount = curr.length;
  all[courseIndex] = course;

  await uploadCoursesToCloud(all);
  return course;
}

// Add or Update Lesson (Sync wrapper)
export function addOrUpdateLesson(
  courseSlug: string,
  lessonData: {
    id?: string;
    title: string;
    duration?: string;
    videoUrl?: string;
    type?: string;
    isLocked?: boolean;
    fileUrl?: string;
    fileName?: string;
    fileSize?: string;
    quizData?: any;
    items?: any[];
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

  const newSection: any = {
    id: lessonId,
    title: lessonData.title,
    duration: lessonData.duration || '20 دقيقة',
    isLocked: lessonData.isLocked ?? false,
    type: lessonData.type || 'video',
    videoUrl: lessonData.videoUrl || '',
    fileUrl: lessonData.fileUrl,
    fileName: lessonData.fileName,
    fileSize: lessonData.fileSize,
    quizData: lessonData.quizData,
    items: lessonData.items,
    lessons: lessonData.subLessons && lessonData.subLessons.length > 0 ? lessonData.subLessons : [lessonData.title],
  };

  if (existingLessonIndex >= 0) {
    curr[existingLessonIndex] = { ...curr[existingLessonIndex], ...newSection };
  } else {
    curr.push(newSection);
  }

  course.curriculum = curr;
  course.lessonsCount = curr.length;
  all[courseIndex] = course;

  uploadCoursesToCloud(all).catch(console.error);
  return course;
}

// Delete Lesson (Async)
export async function deleteLessonAsync(courseSlug: string, lessonId: string): Promise<Course | null> {
  const all = await getAllCoursesAsync();
  const course = await getCourseBySlugAsync(courseSlug);
  if (!course) return null;

  const courseIndex = all.findIndex((c) => c.slug === course.slug);
  if (courseIndex === -1) return null;

  const curr = (course.curriculum || []).filter((l) => l.id !== lessonId);
  course.curriculum = curr;
  course.lessonsCount = curr.length;
  all[courseIndex] = course;

  await uploadCoursesToCloud(all);
  return course;
}

// Delete Lesson (Sync wrapper)
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

  uploadCoursesToCloud(all).catch(console.error);
  return course;
}
