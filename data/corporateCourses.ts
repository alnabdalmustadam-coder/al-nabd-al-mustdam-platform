import { CourseCategory } from "@/types";

export interface CorporateCourse {
  id: number;
  title: string;
  slug: string;
  category: string;
  iconType: "shield" | "cloud" | "computer" | "code" | "file" | "chart" | "users" | "brain" | "check" | "briefcase" | "target" | "speaker" | "book" | "office" | "heart";
}

export const corporateCategories: { key: string, label: string }[] = [
  { key: "all", label: "الكل" },
  { key: "tech", label: "تقنية وأمن سيبراني" },
  { key: "admin", label: "أعمال مكتبية وسكرتارية" },
  { key: "management", label: "إدارة وأعمال" },
  { key: "marketing", label: "تسويق ومبيعات" },
  { key: "soft-skills", label: "تطوير الذات ومهارات لينة" },
  { key: "general", label: "دورات عامة وشهادات" },
];

export const corporateCourses: CorporateCourse[] = [
  // Image 1 & Tech overlaps
  { id: 1, title: "التدريب على اساسيات لينكس كومبتيا", slug: "linux-comptia-basics", category: "tech", iconType: "computer" },
  { id: 2, title: "التدريب على أساسيات مايكروسوفت أزور Microsoft Azure Fundamentals", slug: "azure-fundamentals", category: "tech", iconType: "cloud" },
  { id: 3, title: "التدريب على مهارات مدقق نظم معلومات معتمد Certified Information Systems Auditor", slug: "cisa-training", category: "tech", iconType: "shield" },
  { id: 4, title: "التدريب على سيسكو للأمن السيبراني Cisco Certified CyberOps Associate", slug: "cisco-cyberops", category: "tech", iconType: "shield" },
  { id: 5, title: "مايكروسوفت بوربوينت", slug: "ms-powerpoint", category: "admin", iconType: "file" },
  { id: 6, title: "مايكروسوفت وورد", slug: "ms-word", category: "admin", iconType: "file" },
  { id: 7, title: "مايكروسوفت ويندوز اكس بي", slug: "ms-windows-xp", category: "admin", iconType: "computer" },
  { id: 8, title: "مايكروسوفت اكسل", slug: "ms-excel", category: "admin", iconType: "chart" },
  { id: 9, title: "التدريب على برمجة فيجوال بيسك دوت نت وقواعد البيانات", slug: "vb-net-databases", category: "tech", iconType: "code" },
  { id: 10, title: "التدريب على برنامج فوتوشوب", slug: "photoshop-training", category: "tech", iconType: "target" }, // or design
  { id: 11, title: "مدخل بيانات", slug: "data-entry", category: "admin", iconType: "file" },
  { id: 12, title: "تطوير مهارات اخصائي موارد بشرية", slug: "hr-specialist-skills", category: "management", iconType: "users" },
  { id: 13, title: "التدريب على صيانة الحاسب عمل الشبكة بين جهازين", slug: "pc-maintenance-networking", category: "tech", iconType: "computer" },
  { id: 14, title: "الطباعة بالعربي", slug: "arabic-typing", category: "admin", iconType: "file" },
  
  // Image 2
  { id: 15, title: "مهارات البيع الفعال", slug: "effective-sales", category: "marketing", iconType: "target" },
  { id: 16, title: "اساسيات إدارة الأعمال الاحترافية", slug: "pro-business-admin", category: "management", iconType: "briefcase" },
  { id: 17, title: "مهارات التواصل الفعال", slug: "effective-communication", category: "soft-skills", iconType: "speaker" },
  { id: 18, title: "تدريب المدربين", slug: "tot-training", category: "management", iconType: "users" },
  { id: 19, title: "تدريب المدربين في الخدمة الاجتماعية", slug: "tot-social-service", category: "management", iconType: "heart" },
  { id: 20, title: "اتيكيت الاستقبال وفن خدمة العملاء", slug: "reception-customer-service", category: "marketing", iconType: "users" },
  { id: 21, title: "مفاهيم ومهارات في ادارة المستشفيات", slug: "hospital-management", category: "management", iconType: "check" },
  { id: 22, title: "نظام العمل السعودي", slug: "saudi-labor-law", category: "management", iconType: "file" },
  { id: 23, title: "دورة ASP NET MVC", slug: "asp-net-mvc", category: "tech", iconType: "code" },
  { id: 24, title: "موظف ٢٠٣٠ للتسويق الالكتروني", slug: "employee-2030-emarketing", category: "marketing", iconType: "chart" },
  { id: 25, title: "صيانة برمجيات الجوالات", slug: "mobile-software-maintenance", category: "tech", iconType: "computer" },
  { id: 26, title: "تطوير مهارات مندوب تسويق", slug: "marketing-rep-skills", category: "marketing", iconType: "target" },
  { id: 27, title: "دورة C Sharp", slug: "c-sharp-course", category: "tech", iconType: "code" },
  { id: 28, title: "إدارة حسابات العملاء وخدمة الضيوف", slug: "customer-accounts-management", category: "management", iconType: "users" },
  { id: 29, title: "التخطيط الاستراتيجي", slug: "strategic-planning", category: "management", iconType: "chart" },
  { id: 30, title: "دورة القدرات العامة لطلاب الثانوية العامة", slug: "general-aptitude-test", category: "general", iconType: "book" },

  // Image 3
  { id: 31, title: "إدارة النزاعات في العمل", slug: "workplace-conflict-management", category: "management", iconType: "users" },
  { id: 32, title: "إدارة الجودة في المنشآت الصحية", slug: "healthcare-quality-management", category: "management", iconType: "check" },
  { id: 33, title: "مفاهيم التجارة الإلكترونية", slug: "ecommerce-concepts", category: "marketing", iconType: "chart" },
  { id: 34, title: "تطوير مهارات مدراء الاقسام والمشرفين", slug: "managerial-skills-development", category: "management", iconType: "briefcase" },
  { id: 35, title: "مهارات تحليل المخاطر ونقاط التحكم الحرجة", slug: "risk-analysis-skills", category: "management", iconType: "shield" },
  { id: 36, title: "ادارة المشاريع المتناهية الصغر", slug: "micro-project-management", category: "management", iconType: "briefcase" },
  { id: 37, title: "السكرتارية التنفيذية", slug: "executive-secretariat", category: "admin", iconType: "office" },
  { id: 38, title: "إدارة ميزانية الاسرة", slug: "family-budget-management", category: "management", iconType: "chart" },
  { id: 39, title: "مهارات الاشراف الاداري", slug: "admin-supervision-skills", category: "management", iconType: "users" },
  { id: 40, title: "التميز في خدمة العملاء", slug: "customer-service-excellence", category: "marketing", iconType: "target" },
  { id: 41, title: "استراتيجيات التعليم الإبداعي", slug: "creative-teaching-strategies", category: "general", iconType: "brain" },
  { id: 42, title: "الإدارة اليابانية ( كايزن)", slug: "japanese-management-kaizen", category: "management", iconType: "check" },
  { id: 43, title: "فن الادارة الصفية", slug: "classroom-management-art", category: "general", iconType: "board" as any },
  { id: 44, title: "تقنيات التعليم الالكتروني", slug: "elearning-technologies", category: "general", iconType: "computer" },
  { id: 45, title: "المقاييس الاجتماعية", slug: "social-metrics", category: "soft-skills", iconType: "users" },
  { id: 46, title: "فنيات المقابلة الارشادية", slug: "counseling-interview-techniques", category: "soft-skills", iconType: "speaker" },
  { id: 47, title: "التعلم القائم على المشاريع", slug: "project-based-learning", category: "general", iconType: "book" },
  { id: 48, title: "دورة إدارة الأزمات والمخاطر", slug: "crisis-risk-management", category: "management", iconType: "shield" },
  { id: 49, title: "إدارة المهام المتعددة و ترتيب الاولويات", slug: "multitasking-prioritization", category: "soft-skills", iconType: "check" },
  { id: 50, title: "الأمن السيبراني", slug: "cybersecurity-basics", category: "tech", iconType: "shield" },

  // Image 4 & 5 Extra Unique
  { id: 51, title: "إدارة التغيير الذاتي", slug: "self-change-management", category: "soft-skills", iconType: "brain" },
  { id: 52, title: "الإعداد لاختبار الرخصة المهنية في علم الاجتماع", slug: "pro-license-sociology", category: "general", iconType: "book" },
  { id: 53, title: "السلامة والصحة المهنية طبقاً لمعايير نيبوش IGC", slug: "nebosh-igc", category: "general", iconType: "shield" },
  { id: 54, title: "تحليل البيانات وعمل الإحصائيات", slug: "data-analysis-stats", category: "tech", iconType: "chart" },
  { id: 55, title: "إدارة المراكز الصحية", slug: "health-centers-management", category: "management", iconType: "office" },
  { id: 56, title: "دورة التصاميم الإعلانية - Adverts Designing Course", slug: "adverts-designing", category: "marketing", iconType: "target" },
  { id: 57, title: "التحقيق الجنائي الرقمي", slug: "digital-forensics", category: "tech", iconType: "shield" },
  { id: 58, title: "COMPTIA SECURITY +", slug: "comptia-security-plus", category: "tech", iconType: "shield" },
  { id: 59, title: "دورة محاسبة لغير المحاسبين", slug: "accounting-non-accountants", category: "management", iconType: "chart" },
  { id: 60, title: "وقاء السلوك", slug: "behavior-prevention", category: "soft-skills", iconType: "heart" },
  { id: 61, title: "مقدمة في الذكاء الاصطناعي", slug: "ai-intro", category: "tech", iconType: "brain" },
  { id: 62, title: "مهارات تبليغ الأخبار المزعجة", slug: "bad-news-delivery", category: "soft-skills", iconType: "speaker" },
  { id: 63, title: "صناعة مبادرات غرس القيم", slug: "values-initiatives", category: "soft-skills", iconType: "heart" },
  { id: 64, title: "التدريب على مهارات محلل الأمن السيبراني CompTIA (CySA+)", slug: "comptia-cysa-plus", category: "tech", iconType: "shield" },
  { id: 65, title: "تصميم الجرافيكس وتطبيقاته", slug: "graphics-design", category: "tech", iconType: "target" },
  { id: 66, title: "دورة الهاكر الأخلاقي", slug: "ethical-hacker", category: "tech", iconType: "shield" },
  { id: 67, title: "تطبيقات تنكركاد في تدريب هندسة الاتصالات والإلكترونيات", slug: "tinkercad-telecom", category: "tech", iconType: "code" },
  { id: 68, title: "سفراء الإيجابية", slug: "ambassadors-positivity", category: "soft-skills", iconType: "heart" },
  { id: 69, title: "المدقق الرئيسي لإدارة الجودة أيزو ٩٠٠١", slug: "iso-9001-lead-auditor", category: "management", iconType: "check" },
  { id: 70, title: "إعداد المدربين في الخدمة الاجتماعية", slug: "tot-social-service-prep", category: "management", iconType: "users" },
  { id: 71, title: "LabVIEW Applications & Programming", slug: "labview-programming", category: "tech", iconType: "code" },
  { id: 72, title: "مهارات موظف الاتصال المؤسسي", slug: "corporate-comms-skills", category: "soft-skills", iconType: "speaker" },
  { id: 73, title: "مهارات إعداد وكتابة التقارير", slug: "report-writing-skills", category: "admin", iconType: "file" },
  { id: 74, title: "قيادة مجموعات العمل", slug: "workgroups-leadership", category: "management", iconType: "users" },
  { id: 75, title: "أساسيات الحماية لسلامة المنشآت", slug: "facility-safety-basics", category: "general", iconType: "shield" },
  { id: 76, title: "مهارات التحقيق الاداري", slug: "admin-investigation-skills", category: "management", iconType: "briefcase" },
];
