export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizData {
  id?: string;
  title: string;
  passingScore?: number; // e.g. 70 (%)
  durationMinutes?: number;
  questions: QuizQuestion[];
}

export interface CourseAttachment {
  id: string;
  title: string;
  fileUrl: string;
  fileType?: 'pdf' | 'doc' | 'word' | 'ppt' | 'zip' | 'other';
  fileSize?: string;
}

export interface SubLessonItem {
  id: string;
  title: string;
  duration?: string;
  type?: 'video' | 'pdf' | 'doc' | 'quiz' | 'article';
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  isLocked?: boolean;
  quizData?: QuizData;
}

export interface CurriculumSection {
  id?: string;
  title: string;
  duration: string;
  isLocked?: boolean;
  type?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  quizData?: QuizData;
  items?: SubLessonItem[];
  lessons?: (string | SubLessonItem)[];
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  oldPrice?: number;
  currency?: string;
  category: CourseCategory;
  level: CourseLevel;
  rating: number;
  reviewsCount?: number;
  studentsCount?: number;
  duration: string;
  lessonsCount: number;
  image: string;
  instructor?: string;
  instructorImage?: string;
  instructorBio?: string;
  featured: boolean;
  outcomes: string[];
  curriculum: CurriculumSection[];
  attachments?: CourseAttachment[];
  finalExam?: QuizData;
  whyThisCourse?: string[];
  requirements?: string;
  trainerId?: string;
  enrollees?: number;
  ghlCourseId?: string;
  ghlCheckoutUrl?: string;
}

export type CourseCategory = 'tech' | 'languages' | 'security' | 'corporate' | 'management' | 'design' | 'admin' | 'data';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface Testimonial {
  id: number;
  name: string;
  gender?: 'male' | 'female';
  role: string;
  avatar: string;
  content: string;
  rating: number;
  courseTitle: string;
}

export interface Trainer {
  id: number;
  name: string;
  specialization: string;
  bio: string;
  image: string;
  coursesCount: number;
  studentsCount: number;
  rating: number;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  icon: string;
}
