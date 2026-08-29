export interface CertificateCanvasElement {
  id: string;
  type: 'text' | 'qr' | 'seal' | 'badge' | 'signature' | 'image' | 'custom_text';
  label: string;
  x: number; // Percentage from left (0 to 100)
  y: number; // Percentage from top (0 to 100)
  content?: string; // Text string or template variable like {student_name}
  variableKey?: 'student_name' | 'course_title' | 'cert_code' | 'issue_date' | 'grade' | 'hours' | 'custom';
  fontSize?: number; // In px
  fontWeight?: 'normal' | 'medium' | 'bold' | 'black';
  fontFamily?: 'cairo' | 'amiri' | 'tajawal' | 'alexandria' | 'changa';
  color?: string; // Hex color
  textAlign?: 'right' | 'center' | 'left';
  width?: number; // Size in px
  height?: number; // Size in px
  visible: boolean;
  isLocked?: boolean;
  borderBottom?: boolean;
  customImageUrl?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  courseTitle: string;
  courseId?: string;
  bgType: 'image' | 'preset' | 'custom';
  bgPreset?: 'royal-gold' | 'emerald-official' | 'classic-navy' | 'modern-clean';
  imageUrl: string;
  headerTitle: string;
  subtitle: string;
  statement: string;
  bodyText: string;
  issuerName: string;
  signatory1Title: string;
  signatory1Name: string;
  signatory2Title: string;
  signatory2Name: string;
  showQrCode: boolean;
  showNationalSeal: boolean;
  showInstituteSeal: boolean;
  accentColor: string;
  autoIssue: boolean;
  elementsLayout?: CertificateCanvasElement[];
  issuedCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssuedCertificate {
  id: string;
  code: string;
  studentName: string;
  studentEmail?: string;
  courseTitle: string;
  templateId?: string;
  issueDate: string;
  grade: string;
  hours: string;
  status: 'active' | 'revoked';
  imageUrl: string;
  customData?: Record<string, any>;
  createdAt: string;
}

export const DEFAULT_CERTIFICATE_ELEMENTS: CertificateCanvasElement[] = [
  // 1. Accreditation & Issuer Top Header
  {
    id: 'el-issuer',
    type: 'text',
    label: 'اسم الجهة المانحة والسجل',
    x: 20,
    y: 12,
    content: 'معهد النبض المستدام العالي للتدريب\nسجل اعتماد رقم: 2026/88421',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'cairo',
    color: '#173A7C',
    textAlign: 'right',
    visible: true,
  },
  {
    id: 'el-national-seal',
    type: 'badge',
    label: 'شارة اعتماد المركز الوطني NELC',
    x: 82,
    y: 12,
    content: 'معتمد رسمياً',
    fontSize: 11,
    fontWeight: 'black',
    color: '#065F46',
    visible: true,
  },
  // 2. Main Certificate Titles
  {
    id: 'el-header-title',
    type: 'text',
    label: 'عنوان الشهادة الرئيسي',
    x: 50,
    y: 24,
    content: 'شهادة إتمام وتفوق معتمدة',
    fontSize: 26,
    fontWeight: 'black',
    fontFamily: 'cairo',
    color: '#173A7C',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'el-subtitle',
    type: 'text',
    label: 'المسمى الثانوي بالإنجليزية',
    x: 50,
    y: 31,
    content: 'CERTIFICATE OF COMPLETION & EXCELLENCE',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'cairo',
    color: '#64748B',
    textAlign: 'center',
    visible: true,
  },
  // 3. Statement & Student Name
  {
    id: 'el-statement',
    type: 'text',
    label: 'صيغة التصدير والإقرار',
    x: 50,
    y: 40,
    content: 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
    fontSize: 13,
    fontWeight: 'bold',
    fontFamily: 'cairo',
    color: '#475569',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'el-student-name',
    type: 'text',
    label: 'اسم المتدرب / الطالب',
    x: 50,
    y: 49,
    content: '{student_name}',
    variableKey: 'student_name',
    fontSize: 24,
    fontWeight: 'black',
    fontFamily: 'amiri',
    color: '#152C5B',
    textAlign: 'center',
    borderBottom: true,
    visible: true,
  },
  // 4. Body & Course Title
  {
    id: 'el-body-text',
    type: 'text',
    label: 'نص الإنجاز واكتمال الساعات',
    x: 50,
    y: 59,
    content: 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها النظرية والتطبيقية بكفاءة واقتدار.',
    fontSize: 12,
    fontWeight: 'medium',
    fontFamily: 'cairo',
    color: '#334155',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'el-course-title',
    type: 'text',
    label: 'عنوان المساق التدريبي',
    x: 50,
    y: 68,
    content: '{course_title}',
    variableKey: 'course_title',
    fontSize: 16,
    fontWeight: 'black',
    fontFamily: 'cairo',
    color: '#B45309',
    textAlign: 'center',
    visible: true,
  },
  // 5. Signatories, QR and Stamp
  {
    id: 'el-sig-1',
    type: 'signature',
    label: 'اعتماد المشرف الأكاديمي (اليمين)',
    x: 20,
    y: 84,
    content: 'المشرف الأكاديمي والتدريب\nد. عبدالرحمن الغامدي\nتوقيع إلكتروني موثق ✔',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'cairo',
    color: '#1E293B',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'el-qr',
    type: 'qr',
    label: 'رمز التحقق الذكي QR Code',
    x: 50,
    y: 84,
    content: 'SA-TTI-2026-98421',
    width: 60,
    height: 60,
    visible: true,
  },
  {
    id: 'el-sig-2',
    type: 'signature',
    label: 'اعتماد المدير التنفيذي (اليسار)',
    x: 80,
    y: 84,
    content: 'المدير التنفيذي للمعهد\nأ. نورة الشمري\nتوقيع إلكتروني موثق ✔',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'cairo',
    color: '#1E293B',
    textAlign: 'center',
    visible: true,
  },
  {
    id: 'el-institute-seal',
    type: 'seal',
    label: 'ختم المعهد الرسمي المذهب',
    x: 14,
    y: 72,
    width: 75,
    height: 75,
    visible: true,
  },
];
