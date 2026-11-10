import type { User } from '@supabase/supabase-js';
import { blogPosts } from '@/data/blogPosts';
import { demoCourses } from '@/data/courses';

export const DEMO_COOKIE = 'madar_demo_session_v2';
export { DEMO_READ_ONLY } from './messages';
export const DEMO_ROLES = ['student', 'instructor', 'admin'] as const;
export type DemoRole = typeof DEMO_ROLES[number];
export type DemoRow = Record<string, unknown>;

export const isDemoRole = (role: unknown): role is DemoRole => DEMO_ROLES.some(value => value === role);

const date = '2026-10-26T10:00:00.000Z';
const avatar = '/demo/madar/avatar.svg';
const makeUser = (id: string, name: string, email: string, role: string): User => ({
  id, email, aud: 'authenticated', role: 'authenticated', created_at: date,
  email_confirmed_at: date, app_metadata: { role }, user_metadata: { full_name: name, avatar_url: avatar },
});

export const demoUsers: Record<DemoRole, User> = {
  student: makeUser('11111111-1111-4111-8111-111111111111', 'ريم الحربي', 'learner@madar.example', 'STUDENT'),
  instructor: makeUser('11111111-1111-4111-8111-111111111112', 'سارة ناصر', 'trainer@madar.example', 'INSTRUCTOR'),
  admin: makeUser('11111111-1111-4111-8111-111111111113', 'عمر فهد', 'admin@madar.example', 'ADMIN'),
};

const otherStudent = makeUser('11111111-1111-4111-8111-111111111114', 'زياد خالد', 'trainee@madar.example', 'STUDENT');
const otherTrainer = makeUser('11111111-1111-4111-8111-111111111115', 'نورة علي', 'coach@madar.example', 'INSTRUCTOR');
const thirdTrainer = makeUser('11111111-1111-4111-8111-111111111116', 'م. فيصل الشمري', 'cyber@madar.example', 'INSTRUCTOR');
export const demoAccounts = [...Object.values(demoUsers), otherStudent, otherTrainer, thirdTrainer];
export const demoUser = (role: unknown) => isDemoRole(role) ? demoUsers[role] : null;

const [quality, data, teams] = demoCourses;
const student = demoUsers.student;
const instructor = demoUsers.instructor;
const name = (user: User) => String(user.user_metadata.full_name);

const profiles = demoAccounts.map(user => ({
  id: user.id, full_name: name(user), email: user.email, role: user.app_metadata.role, avatar_url: avatar,
  status: 'active',
  specialty: user.id === thirdTrainer.id ? 'الأمن السيبراني والتحول الرقمي' : user.app_metadata.role === 'INSTRUCTOR' ? 'الجودة وتطوير المهارات' : '',
  bio: user.id === thirdTrainer.id ? 'خبير واستشاري في الأمن السيبراني وحماية البنية الرقمية المؤسسية.' : user.id === instructor.id ? 'مدرّبة في الجودة وتحسين العمليات وتطوير مهارات فرق العمل.' : user.id === otherTrainer.id ? 'مدرّبة في التواصل الفعّال وإدارة فرق العمل وتطوير الأداء.' : '',
  created_at: date, updated_at: date, nelc_eligible: false,
}));
const enroll = (id: string, user: User, course: typeof quality, progress: number) => ({
  id, user_id: user.id, email: user.email, course_id: course.slug, course_title: course.title,
  progress, status: progress === 100 ? 'completed' : 'active', enrolled_at: date, created_at: date,
  completed_at: progress === 100 ? '2026-11-02T10:00:00.000Z' : null,
});

const certificateTemplate = '11111111-1111-4111-8111-111111111121';
const serviceCategory = { id: 'demo-consulting', name: 'تطوير مهني', slug: 'consulting', is_active: true, sort_order: 1 };
const assignment = { id: 'demo-assignment', title: 'اقتراح مؤشر قابل للقياس',
  description: 'اختر عملية عمل واكتب كيف تقيس أثر تغيير واحد عليها.',
  course_id: quality.slug, course_title: quality.title, instructor_id: instructor.id, status: 'published',
  due_date: '2026-12-03T15:00:00.000Z', created_at: date, max_score: 100 };
const ticket = { id: 'demo-ticket', user_id: student.id, email: student.email, subject: 'الاستفسار عن موارد الدورة',
  message: 'أين أجد نموذج خطة التحسين؟', description: 'أين أجد نموذج خطة التحسين؟', status: 'open',
  category: 'الدورات', priority: 'normal', created_at: date, updated_at: date };

export const demoTables: Record<string, readonly DemoRow[]> = {
  profiles,
  course_catalog: demoCourses.map(course => ({
    id: course.id, slug: course.slug, title: course.title, price: course.price,
    status: course.status, payload: course, created_at: date, updated_at: date, created_by: instructor.id,
  })),
  enrollments: [
    enroll('demo-enrollment-quality', student, quality, 88),
    enroll('demo-enrollment-data', student, data, 100),
    enroll('demo-enrollment-teams', student, teams, 12),
    enroll('demo-enrollment-second', otherStudent, quality, 50),
  ],
  platform_settings: [
    { key: 'platformName', value: 'مَدار للتعلّم' },
    { key: 'platformLogo', value: '/logo.svg' },
    { key: 'contactEmail', value: 'hello@madar.example' },
  ],
  assignments: [assignment],
  assignment_submissions: [{
    id: 'demo-submission', assignment_id: assignment.id, assignment_title: assignment.title, assignments: assignment,
    user_id: student.id, student_id: student.id, student_name: name(student), profiles: profiles[0], email: student.email,
    course_id: quality.slug, course_title: quality.title, file_url: '/demo/madar/improvement-template.docx',
    notes: 'سأقيس الوقت من وصول الطلب إلى بدء الخدمة، قبل التجربة وبعدها.',
    grade: 92, status: 'graded', feedback: 'حددت المؤشر بوضوح. أضف فترة موحّدة لجمع البيانات.',
    submitted_at: date, graded_at: date, created_at: date,
  }],
  quizzes: [{
    id: 'demo-quiz', title: 'أساسيات تحسين العمليات', description: 'مراجعة مبادئ القياس والتجربة.',
    course_id: quality.slug, course_title: quality.title, instructor_id: instructor.id, status: 'published', is_active: true,
    questions: quality.finalExam?.questions || [], passing_score: 80, duration_minutes: 8, created_at: date,
  }],
  quiz_attempts: [{
    id: 'demo-quiz-attempt', quiz_id: 'demo-quiz', user_id: student.id, student_id: student.id, email: student.email,
    course_id: quality.slug, score: 92, passed: true, status: 'completed', completed_at: date, created_at: date,
  }],
  live_sessions: [{
    id: 'demo-session', title: 'لقاء تطبيقي عن تحسين العمليات', description: 'مناقشة خطة تحسين قصيرة وقراءة نتائجها.',
    instructor_id: instructor.id, instructor_name: name(instructor), course_id: quality.slug, course_title: quality.title,
    status: 'scheduled', start_time: '2026-12-01T16:00:00.000Z', scheduled_at: '2026-12-01T16:00:00.000Z',
    scheduled_date: '2026-12-01T16:00:00.000Z', duration: 45, duration_minutes: 45, created_at: date,
  }],
  certificate_templates: [{
    id: certificateTemplate, name: 'قالب إتمام التدريب', course_title: data.title,
    image_url: '/1.png', auto_issue: false, created_at: date, updated_at: date,
    payload: { courseId: data.slug, bgType: 'image', bgPreset: 'modern-clean', headerTitle: 'شهادة إتمام',
      subtitle: 'CERTIFICATE OF COMPLETION', statement: 'تُمنح هذه الشهادة إلى',
      bodyText: 'لإكمال برنامج تدريبي ضمن جولة العرض.', issuerName: 'مَدار للتعلّم', showQrCode: false,
      showNationalSeal: false, showInstituteSeal: false, accentColor: '#2C604E',
      signatory1Name: 'فريق التدريب', signatory1Title: 'إشراف البرامج', signatory2Name: 'أكاديمية مَدار', signatory2Title: 'إدارة التعلّم',
    },
  }],
  certificates: [{
    id: '11111111-1111-4111-8111-111111111122', certificate_code: 'MD-2026-1001',
    issued_at: date, updated_at: date, template_id: certificateTemplate, pdf_url: null, status: 'active',
    payload: { studentName: name(student), studentEmail: student.email, courseTitle: data.title,
      issueDate: '26 أكتوبر 2026', grade: '92%', hours: 'ساعتان', imageUrl: '/1.png' },
  }],
  support_tickets: [ticket],
  ticket_replies: [{
    id: 'demo-reply', ticket_id: ticket.id, user_id: demoUsers.admin.id, author_name: 'فريق دعم مَدار',
    message: 'تجدي النموذج في تبويب المرفقات داخل محطة ورقة العمل.', content: 'تجدي النموذج في تبويب المرفقات داخل محطة ورقة العمل.',
    is_admin: true, created_at: date,
  }],
  surveys: [{ id: 'demo-survey', title: 'تجربة التعلّم', description: 'استبيان مختصر لقياس وضوح المحتوى.',
    status: 'active', is_active: true, created_at: date, questions: [] }],
  content_satisfaction: [{ course_id: quality.id, user_id: student.id, content_kind: 'lesson', content_key: 'quality-video', created_at: date }],
  coupons: [{ id: 'demo-coupon', code: 'MADAR20', discount: 20, discount_type: 'percentage', discount_value: 20, is_active: true, created_at: date }],
  orders: [{ id: 'demo-order', email: student.email, user_id: student.id, amount: 150, total: 150, total_amount: 150,
    currency: 'SAR', status: 'paid', course_title: data.title, created_at: date }],
  projects: [{ id: 'demo-project', user_id: student.id, email: student.email, title: 'خطة تحسين خدمة',
    description: 'مراجعة خطوات استقبال طلبات التدريب وتحديد فرص تحسينها.', status: 'completed', created_at: date }],
  notifications: [{ id: 'demo-notice', user_id: student.id, title: 'المرفقات جاهزة', message: 'تمت إتاحة موارد دورة الجودة.', is_read: false, created_at: date }],
  admin_content_items: blogPosts.map(post => ({
    id: 'demo-article-'+post.id, kind: 'article', slug: post.slug, title: post.title, status: 'published',
    payload: post, is_featured: true, created_by: instructor.id, created_at: date, updated_at: date,
  })),
  service_categories: [serviceCategory],
  services: [{
    id: 'demo-improvement-session', title: 'جلسة تصميم خطة تحسين', description: 'جلسة توضيحية لترتيب المشكلة والمؤشر وخطوات التجربة.',
    long_description: 'تدريب تطبيقي على تصميم تجربة تحسين قصيرة لفريق عمل.', price: 150, currency: 'SAR',
    delivery_days: 3, revision_count: 1, thumbnail_url: '/images/blog/iso-risk-management.jpg', status: 'active',
    is_featured: true, rating_avg: 4.8, orders_count: 7, category_id: serviceCategory.id, service_categories: serviceCategory,
    provider_id: instructor.id, provider_name: name(instructor), provider_role: 'مدرّبة', created_at: date,
  }],
};

export const demoSatisfaction = {
  learners: 12,
  courses: [{ course_id: quality.id, hearts: 18, learners: 12, lesson_hearts: 14, quiz_hearts: 4 }],
  contents: [{ course_id: quality.id, content_kind: 'lesson', content_key: 'quality-video', title: 'من الملاحظة إلى التحسين', hearts: 14 }],
};
