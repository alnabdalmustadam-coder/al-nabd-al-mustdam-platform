import 'server-only';

import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/observability/logger';
import { findCourseByIdentifier } from '@/lib/public-courses';
import type { Course, CourseCategory, CourseLevel, CurriculumSection } from '@/types';

type CourseStatus = 'draft' | 'published' | 'archived';
type CourseInput = Partial<Course> & { title: string; status?: CourseStatus };
type CourseReadOptions = { includeUnpublished?: boolean };
type CourseWriteOptions = { instructorId?: string };
type CourseRow = {
  id: number;
  slug: string;
  title: string;
  price: number | string;
  status: CourseStatus;
  payload: unknown;
};

type LessonInput = {
  id?: string;
  title: string;
  duration?: string;
  videoUrl?: string;
  type?: string;
  isLocked?: boolean;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  quizData?: CurriculumSection['quizData'];
  items?: CurriculumSection['items'];
  subLessons?: string[];
};

export class CoursePersistenceError extends Error {
  constructor(message = 'تعذر حفظ الدورة في قاعدة البيانات. حاول مرة أخرى بعد التحقق من إعدادات الاتصال.') {
    super(message);
    this.name = 'CoursePersistenceError';
  }
}

export class CourseAccessError extends Error {
  constructor(message = 'يمكنك إدارة الدورات المسندة إلى حسابك فقط', public readonly status = 403) {
    super(message);
    this.name = 'CourseAccessError';
  }
}

function assertCourseOwner(course: Course, instructorId?: string) {
  if (instructorId && course.trainerId !== instructorId) throw new CourseAccessError();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeSlug(title: string, input?: string): string {
  const candidate = (input || title)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff\s_-]/gu, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return candidate || `course-${crypto.randomUUID().slice(0, 8)}`;
}

function toCourse(row: CourseRow): Course {
  const payload = isRecord(row.payload) ? row.payload : {};
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    description: typeof payload.description === 'string' ? payload.description : '',
    longDescription: typeof payload.longDescription === 'string' ? payload.longDescription : undefined,
    price: Number(row.price || 0),
    oldPrice: typeof payload.oldPrice === 'number' ? payload.oldPrice : undefined,
    currency: typeof payload.currency === 'string' ? payload.currency : 'SAR',
    category: (typeof payload.category === 'string' ? payload.category : 'tech') as CourseCategory,
    level: (typeof payload.level === 'string' ? payload.level : 'all') as CourseLevel,
    rating: typeof payload.rating === 'number' ? payload.rating : 5.0,
    reviewsCount: typeof payload.reviewsCount === 'number' ? payload.reviewsCount : 0,
    studentsCount: typeof payload.studentsCount === 'number' ? payload.studentsCount : 0,
    duration: typeof payload.duration === 'string' ? payload.duration : '0 ساعة',
    lessonsCount: typeof payload.lessonsCount === 'number' ? payload.lessonsCount : 0,
    image: typeof payload.image === 'string' ? payload.image : '/logo.webp',
    instructor: typeof payload.instructor === 'string' ? payload.instructor : undefined,
    instructorImage: typeof payload.instructorImage === 'string' ? payload.instructorImage : undefined,
    instructorBio: typeof payload.instructorBio === 'string' ? payload.instructorBio : undefined,
    featured: payload.featured === true,
    outcomes: Array.isArray(payload.outcomes) ? payload.outcomes.filter((item): item is string => typeof item === 'string') : [],
    curriculum: Array.isArray(payload.curriculum) ? payload.curriculum as CurriculumSection[] : [],
    attachments: Array.isArray(payload.attachments) ? payload.attachments as Course['attachments'] : [],
    finalExam: isRecord(payload.finalExam) ? payload.finalExam as unknown as Course['finalExam'] : undefined,
    whyThisCourse: Array.isArray(payload.whyThisCourse) ? payload.whyThisCourse.filter((item): item is string => typeof item === 'string') : [],
    requirements: typeof payload.requirements === 'string' ? payload.requirements : undefined,
    trainerId: typeof payload.trainerId === 'string' ? payload.trainerId : undefined,
    enrollees: typeof payload.enrollees === 'number' ? payload.enrollees : 0,
    ghlCourseId: typeof payload.ghlCourseId === 'string' ? payload.ghlCourseId : undefined,
    ghlCheckoutUrl: typeof payload.ghlCheckoutUrl === 'string' ? payload.ghlCheckoutUrl : undefined,
    status: row.status,
  };
}

const DB_PATH = path.join(process.cwd(), 'data', 'courses-db.json');

function readLocalCourses(): Course[] {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    logger.warn('courses.read_local_failed', { err });
  }
  return [];
}

function writeLocalCourses(list: Course[]) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    logger.warn('courses.write_local_failed', { err });
  }
}

async function fetchRows(includeUnpublished: boolean): Promise<CourseRow[]> {
  try {
    let query = getSupabaseAdmin()
      .from('course_catalog')
      .select('id, slug, title, price, status, payload')
      .order('created_at', { ascending: false });
    if (!includeUnpublished) query = query.eq('status', 'published');
    const { data, error } = await query;
    if (error || !Array.isArray(data)) throw new CoursePersistenceError('تعذر تحميل الدورات. حاول مرة أخرى.');
    // An empty result is authoritative, including after deleting or unpublishing
    // the last course. Bundled JSON must never restore public or management rows.
    return data as CourseRow[];
  } catch (err) {
    logger.error('courses.read_supabase_failed', { err });
    throw err instanceof CoursePersistenceError ? err : new CoursePersistenceError('تعذر تحميل الدورات. حاول مرة أخرى.');
  }
}

export async function getAllCoursesAsync(options: CourseReadOptions = {}): Promise<Course[]> {
  return (await fetchRows(options.includeUnpublished === true)).map(toCourse);
}

export async function getCourseBySlugAsync(
  slugOrId?: string,
  options: CourseReadOptions = {},
): Promise<Course | undefined> {
  if (!slugOrId) return undefined;
  const courses = await getAllCoursesAsync(options);
  return findCourseByIdentifier(courses, slugOrId);
}

export async function getCourseForManagementAsync(identifier: string, instructorId?: string): Promise<Course> {
  const course = await getCourseBySlugAsync(identifier, { includeUnpublished: true });
  if (!course) throw new CourseAccessError('الدورة غير موجودة', 404);
  assertCourseOwner(course, instructorId);
  return course;
}

function buildCoursePayload(input: CourseInput, current?: Course): Omit<Course, 'id'> {
  const curriculum = input.curriculum ?? current?.curriculum ?? [];
  return {
    slug: normalizeSlug(input.title, input.slug || current?.slug),
    title: input.title.trim(),
    description: input.description ?? current?.description ?? '',
    longDescription: input.longDescription ?? current?.longDescription,
    price: input.price ?? current?.price ?? 0,
    oldPrice: input.oldPrice ?? current?.oldPrice,
    currency: input.currency ?? current?.currency ?? 'SAR',
    category: input.category ?? current?.category ?? 'tech',
    level: input.level ?? current?.level ?? 'all',
    rating: input.rating ?? current?.rating ?? 5.0,
    reviewsCount: input.reviewsCount ?? current?.reviewsCount ?? 0,
    studentsCount: input.studentsCount ?? current?.studentsCount ?? 0,
    duration: input.duration ?? current?.duration ?? '0 ساعة',
    lessonsCount: curriculum.length > 0 ? curriculum.length : (input.lessonsCount ?? current?.lessonsCount ?? 0),
    image: input.image ?? current?.image ?? '/logo.webp',
    instructor: input.instructor ?? current?.instructor,
    instructorImage: input.instructorImage ?? current?.instructorImage,
    instructorBio: input.instructorBio ?? current?.instructorBio,
    featured: input.featured ?? current?.featured ?? false,
    outcomes: input.outcomes ?? current?.outcomes ?? [],
    curriculum,
    attachments: input.attachments ?? current?.attachments ?? [],
    finalExam: input.finalExam ?? current?.finalExam,
    whyThisCourse: input.whyThisCourse ?? current?.whyThisCourse ?? [],
    requirements: input.requirements ?? current?.requirements,
    trainerId: input.trainerId ?? current?.trainerId,
    enrollees: input.enrollees ?? current?.enrollees ?? 0,
    ghlCourseId: input.ghlCourseId ?? current?.ghlCourseId,
    ghlCheckoutUrl: input.ghlCheckoutUrl ?? current?.ghlCheckoutUrl,
    status: input.status ?? current?.status ?? 'published',
  };
}

export async function saveCourseAsync(courseData: CourseInput, actorId?: string, options: CourseWriteOptions = {}): Promise<Course> {
  // Resolve the actual write target once using live rows, including drafts.
  // Local fallback data must never authorize a mutation.
  const courses = await getAllCoursesAsync({ includeUnpublished: true });
  const requestedSlug = normalizeSlug(courseData.title, courseData.slug);
  const existing = courseData.id
    ? courses.find((course) => String(course.id) === String(courseData.id))
    : courses.find((course) => course.slug === requestedSlug);
  if (existing) assertCourseOwner(existing, options.instructorId);

  const slugOwner = courses.find((course) => course.slug === requestedSlug);
  if (slugOwner && slugOwner.id !== existing?.id) {
    assertCourseOwner(slugOwner, options.instructorId);
    throw new CourseAccessError('رابط الدورة مستخدم بالفعل. اختر رابطاً آخر.', 409);
  }
  if (courseData.id && !existing) throw new CourseAccessError('الدورة غير موجودة', 404);
  if (options.instructorId && courseData.trainerId !== undefined && courseData.trainerId !== options.instructorId) {
    throw new CourseAccessError('إسناد الدورات إلى مدرب آخر متاح للإدارة فقط');
  }

  const payload = buildCoursePayload({
    ...courseData,
    slug: requestedSlug,
    ...(options.instructorId ? { trainerId: options.instructorId } : {}),
  }, existing);
  const status = payload.status || 'published';
  const values = {
    slug: payload.slug,
    title: payload.title,
    price: payload.price,
    status,
    payload,
    updated_by: actorId || null,
    ...(existing ? {} : { created_by: actorId || null }),
    updated_at: new Date().toISOString(),
  };

  try {
    let query = existing
      ? getSupabaseAdmin().from('course_catalog').update(values).eq('id', existing.id)
      : getSupabaseAdmin().from('course_catalog').insert(values);
    // Recheck ownership in the write itself in case an admin reassigned the
    // course after the lookup. Inserts never overwrite a concurrent slug owner.
    if (existing && options.instructorId) query = query.eq('payload->>trainerId', options.instructorId);
    const { data, error } = await query.select('id, slug, title, price, status, payload').single();
    if (error?.code === '23505') throw new CourseAccessError('رابط الدورة مستخدم بالفعل. اختر رابطاً آخر.', 409);
    if (existing && options.instructorId && error?.code === 'PGRST116') throw new CourseAccessError();
    if (error || !data) {
      logger.error('courses.supabase_write_failed', {
        error,
        courseSlug: payload.slug,
        operation: existing ? 'update' : 'insert',
      });
      throw new CoursePersistenceError();
    }

    const savedCourse = toCourse(data as CourseRow);

    // Local JSON is only a development convenience. Vercel's deployment
    // filesystem is immutable and must never be treated as durable storage.
    if (process.env.NODE_ENV !== 'production') {
      try {
        const list = readLocalCourses();
        const idx = list.findIndex((course) => String(course.id) === String(savedCourse.id) || course.slug === savedCourse.slug);
        if (idx >= 0) list[idx] = savedCourse;
        else list.unshift(savedCourse);
        writeLocalCourses(list);
      } catch (error) {
        logger.warn('courses.local_sync_failed', { error });
      }
    }

    return savedCourse;
  } catch (err) {
    if (err instanceof CoursePersistenceError || err instanceof CourseAccessError) throw err;
    logger.error('courses.supabase_write_failed', { err, courseSlug: payload.slug });
    throw new CoursePersistenceError();
  }
}

export async function deleteCourseAsync(slugOrId: string | number, options: CourseWriteOptions = {}): Promise<boolean> {
  const course = await getCourseForManagementAsync(String(slugOrId).trim(), options.instructorId);
  try {
    let query = getSupabaseAdmin().from('course_catalog').delete().eq('id', course.id);
    if (options.instructorId) query = query.eq('payload->>trainerId', options.instructorId);
    const { data, error } = await query.select('id');
    if (error) {
      logger.error('courses.supabase_delete_failed', { error, slugOrId });
      throw new CoursePersistenceError('فشل حذف الدورة من قاعدة البيانات');
    }
    if (!data?.length) {
      if (options.instructorId) throw new CourseAccessError();
      return false;
    }
  } catch (err) {
    if (err instanceof CoursePersistenceError || err instanceof CourseAccessError) throw err;
    logger.error('courses.supabase_delete_fallback', { err, slugOrId });
    throw new CoursePersistenceError('فشل حذف الدورة من قاعدة البيانات');
  }

  if (process.env.NODE_ENV !== 'production') {
    try {
      const list = readLocalCourses();
      const filtered = list.filter((c) => c.id !== course.id && c.slug !== course.slug);
      writeLocalCourses(filtered);
    } catch (err) {
      logger.error('courses.local_delete_failed', { err });
    }
  }

  return true;
}

export async function addOrUpdateLessonAsync(
  courseSlug: string,
  lessonData: LessonInput,
  actorId?: string,
  options: CourseWriteOptions = {},
): Promise<Course | null> {
  const course = await getCourseForManagementAsync(courseSlug, options.instructorId);
  const lessonId = lessonData.id || crypto.randomUUID();
  const curriculum = [...course.curriculum];
  const lesson: CurriculumSection = {
    id: lessonId,
    title: lessonData.title.trim(),
    duration: lessonData.duration || '0 دقيقة',
    isLocked: lessonData.isLocked ?? false,
    type: lessonData.type || 'video',
    videoUrl: lessonData.videoUrl || '',
    fileUrl: lessonData.fileUrl,
    fileName: lessonData.fileName,
    fileSize: lessonData.fileSize,
    quizData: lessonData.quizData,
    items: lessonData.items,
    lessons: lessonData.subLessons?.length ? lessonData.subLessons : [lessonData.title.trim()],
  };
  const index = curriculum.findIndex((item) => item.id === lessonId);
  if (index >= 0) curriculum[index] = { ...curriculum[index], ...lesson };
  else curriculum.push(lesson);
  return saveCourseAsync({ ...course, curriculum, title: course.title }, actorId, options);
}

export async function deleteLessonAsync(
  courseSlug: string,
  lessonId: string,
  actorId?: string,
  options: CourseWriteOptions = {},
): Promise<Course | null> {
  const course = await getCourseForManagementAsync(courseSlug, options.instructorId);
  const curriculum = course.curriculum.filter((lesson) => lesson.id !== lessonId);
  if (curriculum.length === course.curriculum.length) return null;
  return saveCourseAsync({ ...course, curriculum, title: course.title }, actorId, options);
}
