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
  whyThisCourse?: string[];
  requirements?: string;
  trainerId?: string;
  enrollees?: number;
}

export interface CurriculumSection {
  id?: string;
  title: string;
  lessons?: string[];
  duration: string;
  isLocked?: boolean;
  type?: string;
}

export type CourseCategory = 'tech' | 'languages' | 'security' | 'corporate' | 'management' | 'design' | 'admin' | 'data';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';

export interface Testimonial {
  id: number;
  name: string;
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
