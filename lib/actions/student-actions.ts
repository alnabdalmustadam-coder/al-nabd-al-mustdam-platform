'use client';

import { getCourseAllLessons } from '@/lib/course-lessons';

export { getCourseAllLessons };

// Persistent Storage Keys for Local/Server Sync
const STORAGE_KEYS = {
  COMPLETED_LESSONS: 'sustainsulse_completed_lessons',
  STUDENT_NOTES: 'sustainsulse_student_notes',
  QUIZ_SCORES: 'sustainsulse_quiz_scores',
};

export interface StudentNote {
  id: string;
  lessonId: string;
  text: string;
  date: string;
}

export interface QuizAttempt {
  lessonId: string;
  score: number;
  date: string;
  passed: boolean;
}

// ── Completion Handler ──
export const getCompletedLessons = (courseSlug: string): Set<string> => {
  if (typeof window === 'undefined' || !courseSlug) return new Set<string>();
  try {
    const clean = courseSlug.replace(/^course-/, '').toLowerCase().trim();
    const keysToCheck = [
      `${STORAGE_KEYS.COMPLETED_LESSONS}_${courseSlug}`,
      `${STORAGE_KEYS.COMPLETED_LESSONS}_${clean}`,
      `${STORAGE_KEYS.COMPLETED_LESSONS}_course-${clean}`,
      `nabd_completed_lessons_${courseSlug}`,
      `nabd_completed_lessons_${clean}`,
    ];

    for (const key of keysToCheck) {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return new Set<string>(parsed);
        }
      }
    }
    return new Set<string>();
  } catch (e) {
    return new Set<string>();
  }
};

export const saveCompletedLessons = (courseSlug: string, completedSet: Set<string>): void => {
  if (typeof window === 'undefined' || !courseSlug) return;
  try {
    const clean = courseSlug.replace(/^course-/, '').toLowerCase().trim();
    const arrayData = Array.from(completedSet);
    const json = JSON.stringify(arrayData);

    localStorage.setItem(`${STORAGE_KEYS.COMPLETED_LESSONS}_${courseSlug}`, json);
    localStorage.setItem(`${STORAGE_KEYS.COMPLETED_LESSONS}_${clean}`, json);
    localStorage.setItem(`${STORAGE_KEYS.COMPLETED_LESSONS}_course-${clean}`, json);

    // Notify other components/tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('nabd_progress_updated', {
        detail: { courseSlug, completedCount: completedSet.size }
      }));
    }
  } catch (e) {
    console.error('Failed to persist completed lessons', e);
  }
};

// ── Notes Handler ──
export const getLessonNotes = (lessonId: string): StudentNote[] => {
  if (typeof window === 'undefined') return defaultNotes(lessonId);
  try {
    const raw = localStorage.getItem(`${STORAGE_KEYS.STUDENT_NOTES}_${lessonId}`);
    if (!raw) return defaultNotes(lessonId);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultNotes(lessonId);
  } catch (e) {
    return defaultNotes(lessonId);
  }
};

export const saveLessonNote = (lessonId: string, text: string): StudentNote[] => {
  const existing = getLessonNotes(lessonId);
  const newNote: StudentNote = {
    id: `note-${Date.now()}`,
    lessonId,
    text,
    date: new Date().toLocaleDateString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };
  const updated = [newNote, ...existing];
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${STORAGE_KEYS.STUDENT_NOTES}_${lessonId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist note', e);
    }
  }
  return updated;
};

const defaultNotes = (lessonId: string): StudentNote[] => [
  {
    id: `default-${lessonId}`,
    lessonId,
    text: 'ملاحظة مهمة: قيمة التسامح ركيزة أساسية لبناء مجتمعات مستدامة وواعية.',
    date: 'اليوم، 10:15 ص',
  },
];

// ── Quiz Handler ──
export const saveQuizAttempt = (lessonId: string, score: number): QuizAttempt => {
  const attempt: QuizAttempt = {
    lessonId,
    score,
    date: new Date().toLocaleDateString('ar-SA'),
    passed: score >= 70,
  };
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES) || '{}';
      const parsed = JSON.parse(raw);
      parsed[lessonId] = attempt;
      localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(parsed));
    } catch (e) {
      console.error('Failed to persist quiz attempt', e);
    }
  }
  return attempt;
};

// ── All Notes Fetcher ──
export const getAllSavedNotes = (): (StudentNote & { courseSlug: string; courseTitle: string; lessonTitle: string })[] => {
  const fallback = [
    {
      id: 'b-1',
      lessonId: 'lesson-1',
      courseSlug: 'diploma-tolerance-citizenship',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      lessonTitle: 'الدرس الثالث: قيم التعايش والتسامح في الفكر الإسلامي',
      text: 'ملاحظة مهمة: التسامح قيمة إسلامية أصيلة ترتبط بالعدالة والمواطنة الصالحة.',
      date: 'اليوم، 10:15 ص',
    },
    {
      id: 'b-2',
      lessonId: 'lesson-2',
      courseSlug: 'diploma-tolerance-citizenship',
      courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
      lessonTitle: 'الدرس الثاني: أبعاد المواطنة الصالحة والمسؤولية المجتمعية',
      text: 'المرتكزات الخمسة للتميز المؤسسي والمسؤولية الأمنية.',
      date: 'منذ 4 أيام',
    },
  ];

  if (typeof window === 'undefined') return fallback;

  try {
    const allNotes: (StudentNote & { courseSlug: string; courseTitle: string; lessonTitle: string })[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_KEYS.STUDENT_NOTES)) {
        const lessonId = key.replace(`${STORAGE_KEYS.STUDENT_NOTES}_`, '');
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed: StudentNote[] = JSON.parse(raw);
          parsed.forEach((n) => {
            allNotes.push({
              ...n,
              courseSlug: 'diploma-tolerance-citizenship',
              courseTitle: 'دبلوم التسامح والسلام والمواطنة الصالحة',
              lessonTitle: `ملاحظة الدرس (${lessonId})`,
            });
          });
        }
      }
    }
    return allNotes.length > 0 ? allNotes : fallback;
  } catch (e) {
    return fallback;
  }
};
