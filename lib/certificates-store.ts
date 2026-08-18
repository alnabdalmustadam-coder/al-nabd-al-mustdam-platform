import fs from 'fs';
import path from 'path';

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

interface CertificatesDatabase {
  templates: CertificateTemplate[];
  issued: IssuedCertificate[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'certificates-db.json');

const INITIAL_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'tpl-1',
    name: 'قالب استخدام الحاسب الآلي المعتمد',
    courseTitle: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
    bgType: 'image',
    imageUrl: '/1.png',
    headerTitle: 'شهادة إتمام وتفوق معتمدة',
    subtitle: 'CERTIFICATE OF COMPLETION & EXCELLENCE',
    statement: 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
    bodyText: 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها النظرية والتطبيقية بكفاءة واقتدار.',
    issuerName: 'معهد النبض المستدام العالي للتدريب',
    signatory1Title: 'المشرف الأكاديمي والتدريب',
    signatory1Name: 'د. عبدالرحمن الغامدي',
    signatory2Title: 'المدير التنفيذي للمعهد',
    signatory2Name: 'أ. نورة الشمري',
    showQrCode: true,
    showNationalSeal: true,
    showInstituteSeal: true,
    accentColor: '#173A7C',
    autoIssue: true,
    issuedCount: 1250,
    createdAt: '2026-01-10T12:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'tpl-2',
    name: 'قالب إدخال البيانات ومعالجة النصوص',
    courseTitle: 'دورات ادخال بيانات ومعالجة نصوص',
    bgType: 'image',
    imageUrl: '/2.png',
    headerTitle: 'شهادة اجتياز معتمدة وتأهيل مهني',
    subtitle: 'PROFESSIONAL CERTIFICATE OF ACHIEVEMENT',
    statement: 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
    bodyText: 'قد اجتاز/ت بنجاح البرنامج التأهيلي لإدخال البيانات ومعالجة النصوص المعتمد برصيد الساعات المحددة.',
    issuerName: 'معهد النبض المستدام العالي للتدريب',
    signatory1Title: 'رئيس قسم الحاسب والتقنية',
    signatory1Name: 'م. فهد السبيعي',
    signatory2Title: 'المدير التنفيذي للمعهد',
    signatory2Name: 'أ. نورة الشمري',
    showQrCode: true,
    showNationalSeal: true,
    showInstituteSeal: true,
    accentColor: '#5CB07C',
    autoIssue: true,
    issuedCount: 980,
    createdAt: '2026-02-01T12:00:00Z',
    updatedAt: '2026-08-16T11:00:00Z',
  },
  {
    id: 'tpl-3',
    name: 'القالب الملكي الشرفي Ultra Gold',
    courseTitle: 'كافة المساقات المتقدمة والدبلومات العليا',
    bgType: 'image',
    imageUrl: '/1.png',
    headerTitle: 'شهادة الشرف والامتياز الأكاديمي',
    subtitle: 'HONORARY PROFESSIONAL DIPLOMA',
    statement: 'يشهد مجلس إدارة معهد النبض المستدام بأن المتدرب/ـة:',
    bodyText: 'قد أتم/ت متطلبات المساق التدريبي المتقدم بمرتبة الشرف وحصل/ت على الاعتماد المهني الموثق.',
    issuerName: 'معهد النبض المستدام العالي للتدريب',
    signatory1Title: 'المستشار الأكاديمي العام',
    signatory1Name: 'د. خالد الدوسري',
    signatory2Title: 'رئيس مجلس الإدارة',
    signatory2Name: 'أ. عبدالله الحربي',
    showQrCode: true,
    showNationalSeal: true,
    showInstituteSeal: true,
    accentColor: '#D4AF37',
    autoIssue: false,
    issuedCount: 1790,
    createdAt: '2026-03-15T12:00:00Z',
    updatedAt: '2026-08-17T09:00:00Z',
  },
];

const INITIAL_ISSUED: IssuedCertificate[] = [
  {
    id: 'cert-1',
    code: 'SA-TTI-2026-98421',
    studentName: 'عبدالله الشمري',
    courseTitle: 'دورة استخدام الحاسب الالي في الاعمال المكتبية',
    templateId: 'tpl-1',
    issueDate: '15 مايو 2026',
    grade: 'ممتاز مرتفع (%98)',
    hours: '40 ساعة',
    status: 'active',
    imageUrl: '/1.png',
    createdAt: '2026-05-15T10:00:00Z',
  },
  {
    id: 'cert-2',
    code: 'SA-TTI-2026-44109',
    studentName: 'سارة العتيبي',
    courseTitle: 'دورات ادخال بيانات ومعالجة نصوص',
    templateId: 'tpl-2',
    issueDate: '28 يونيو 2026',
    grade: 'ممتاز (%95)',
    hours: '30 ساعة',
    status: 'active',
    imageUrl: '/2.png',
    createdAt: '2026-06-28T14:30:00Z',
  },
  {
    id: 'cert-3',
    code: 'SA-TTI-2026-11892',
    studentName: 'م. خالد الدوسري',
    courseTitle: 'دورة الذكاء الاصطناعي وهندسة الأوامر',
    templateId: 'tpl-3',
    issueDate: '10 يوليو 2026',
    grade: 'جيد جداً (%88)',
    hours: '45 ساعة',
    status: 'active',
    imageUrl: '/2.png',
    createdAt: '2026-07-10T16:20:00Z',
  },
];

function ensureDbFile(): CertificatesDatabase {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(DB_FILE_PATH)) {
      const initial: CertificatesDatabase = {
        templates: INITIAL_TEMPLATES,
        issued: INITIAL_ISSUED,
      };
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }

    const content = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.templates)) {
      return {
        templates: parsed.templates,
        issued: Array.isArray(parsed.issued) ? parsed.issued : INITIAL_ISSUED,
      };
    }

    return {
      templates: INITIAL_TEMPLATES,
      issued: INITIAL_ISSUED,
    };
  } catch (err) {
    console.error('Error reading certificates db:', err);
    return {
      templates: INITIAL_TEMPLATES,
      issued: INITIAL_ISSUED,
    };
  }
}

function writeDbFile(data: CertificatesDatabase): boolean {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing certificates db:', err);
    return false;
  }
}

// ── TEMPLATES METHODS ──

export function getAllTemplates(): CertificateTemplate[] {
  return ensureDbFile().templates;
}

export function getTemplateById(id: string): CertificateTemplate | undefined {
  const db = ensureDbFile();
  return db.templates.find((t) => t.id === id);
}

export function saveTemplate(templateData: Partial<CertificateTemplate> & { name: string }): CertificateTemplate {
  const db = ensureDbFile();
  const now = new Date().toISOString();

  let existingIndex = -1;
  if (templateData.id) {
    existingIndex = db.templates.findIndex((t) => t.id === templateData.id);
  }

  if (existingIndex >= 0) {
    const updated: CertificateTemplate = {
      ...db.templates[existingIndex],
      ...templateData,
      updatedAt: now,
    };
    db.templates[existingIndex] = updated;
    writeDbFile(db);
    return updated;
  } else {
    const newTemplate: CertificateTemplate = {
      id: templateData.id || `tpl-${Date.now()}`,
      name: templateData.name,
      courseTitle: templateData.courseTitle || 'كافة الدورات التدريبية',
      courseId: templateData.courseId || '',
      bgType: templateData.bgType || 'image',
      bgPreset: templateData.bgPreset || 'royal-gold',
      imageUrl: templateData.imageUrl || '/1.png',
      headerTitle: templateData.headerTitle || 'شهادة إتمام وتفوق معتمدة',
      subtitle: templateData.subtitle || 'CERTIFICATE OF ACHIEVEMENT',
      statement: templateData.statement || 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
      bodyText: templateData.bodyText || 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها المعتمدة بنجاح.',
      issuerName: templateData.issuerName || 'معهد النبض المستدام العالي للتدريب',
      signatory1Title: templateData.signatory1Title || 'المشرف الأكاديمي والتدريب',
      signatory1Name: templateData.signatory1Name || 'د. عبدالرحمن الغامدي',
      signatory2Title: templateData.signatory2Title || 'المدير التنفيذي للمعهد',
      signatory2Name: templateData.signatory2Name || 'أ. نورة الشمري',
      showQrCode: templateData.showQrCode !== undefined ? templateData.showQrCode : true,
      showNationalSeal: templateData.showNationalSeal !== undefined ? templateData.showNationalSeal : true,
      showInstituteSeal: templateData.showInstituteSeal !== undefined ? templateData.showInstituteSeal : true,
      accentColor: templateData.accentColor || '#173A7C',
      autoIssue: templateData.autoIssue !== undefined ? templateData.autoIssue : true,
      issuedCount: templateData.issuedCount || 0,
      createdAt: now,
      updatedAt: now,
    };
    db.templates.unshift(newTemplate);
    writeDbFile(db);
    return newTemplate;
  }
}

export function deleteTemplate(id: string): boolean {
  const db = ensureDbFile();
  const initialLen = db.templates.length;
  db.templates = db.templates.filter((t) => t.id !== id);
  if (db.templates.length !== initialLen) {
    writeDbFile(db);
    return true;
  }
  return false;
}

// ── ISSUED CERTIFICATES METHODS ──

export function getAllIssuedCertificates(): IssuedCertificate[] {
  return ensureDbFile().issued;
}

export function issueCertificate(certData: {
  studentName: string;
  courseTitle: string;
  studentEmail?: string;
  templateId?: string;
  grade?: string;
  hours?: string;
  imageUrl?: string;
  customData?: Record<string, any>;
}): IssuedCertificate {
  const db = ensureDbFile();
  const now = new Date();
  
  // Format Arabic Date
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];
  const formattedDate = `${now.getDate()} ${arabicMonths[now.getMonth()]} ${now.getFullYear()}`;

  // Random unique secure numeric serial
  const randomSerial = Math.floor(10000 + Math.random() * 90000);
  const code = `SA-TTI-${now.getFullYear()}-${randomSerial}`;

  // Find template image if not provided
  let certImage = certData.imageUrl || '/1.png';
  if (certData.templateId) {
    const tpl = db.templates.find((t) => t.id === certData.templateId);
    if (tpl && tpl.imageUrl) {
      certImage = tpl.imageUrl;
    }
  }

  const newCert: IssuedCertificate = {
    id: `cert-${Date.now()}`,
    code,
    studentName: certData.studentName,
    studentEmail: certData.studentEmail,
    courseTitle: certData.courseTitle,
    templateId: certData.templateId || 'tpl-1',
    issueDate: formattedDate,
    grade: certData.grade || 'ممتاز مرتفع (%99)',
    hours: certData.hours || '30 ساعة',
    status: 'active',
    imageUrl: certImage,
    customData: certData.customData,
    createdAt: now.toISOString(),
  };

  db.issued.unshift(newCert);

  // Increment template counter if matched
  if (certData.templateId) {
    const tpl = db.templates.find((t) => t.id === certData.templateId);
    if (tpl) {
      tpl.issuedCount = (tpl.issuedCount || 0) + 1;
    }
  }

  writeDbFile(db);
  return newCert;
}

export function toggleCertificateStatus(id: string): IssuedCertificate | null {
  const db = ensureDbFile();
  const cert = db.issued.find((c) => c.id === id);
  if (!cert) return null;

  cert.status = cert.status === 'active' ? 'revoked' : 'active';
  writeDbFile(db);
  return cert;
}

export function deleteIssuedCertificate(id: string): boolean {
  const db = ensureDbFile();
  const initialLen = db.issued.length;
  db.issued = db.issued.filter((c) => c.id !== id);
  if (db.issued.length !== initialLen) {
    writeDbFile(db);
    return true;
  }
  return false;
}

export function getCertificateByCode(code: string): IssuedCertificate | undefined {
  const db = ensureDbFile();
  return db.issued.find((c) => c.code.toLowerCase().trim() === code.toLowerCase().trim());
}
