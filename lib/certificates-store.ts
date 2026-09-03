import 'server-only';

import { createHash, randomInt } from 'node:crypto';
import legacyCertificatesDatabase from '@/data/certificates-db.json';
import { logger } from '@/lib/observability/logger';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  CertificateCanvasElement,
  CertificateTemplate,
  IssuedCertificate,
  DEFAULT_CERTIFICATE_ELEMENTS,
} from '@/types/certificates';

export type { CertificateCanvasElement, CertificateTemplate, IssuedCertificate };
export { DEFAULT_CERTIFICATE_ELEMENTS };

type JsonRecord = Record<string, unknown>;

type CertificateTemplateRow = {
  id: string;
  name: string;
  course_title: string | null;
  image_url: string | null;
  auto_issue: boolean | null;
  payload: unknown;
  created_at: string;
  updated_at: string;
};

type IssuedCertificateRow = {
  id: string;
  certificate_code: string;
  issued_at: string;
  pdf_url: string | null;
  template_id: string | null;
  status: string | null;
  payload: unknown;
  updated_at: string | null;
};

type CertificateInput = {
  studentName: string;
  courseTitle: string;
  studentEmail?: string;
  templateId?: string;
  grade?: string;
  hours?: string;
  imageUrl?: string;
  customData?: Record<string, unknown>;
};

const TEMPLATE_COLUMNS = 'id, name, course_title, image_url, auto_issue, payload, created_at, updated_at';
const CERTIFICATE_COLUMNS = 'id, certificate_code, issued_at, pdf_url, template_id, status, payload, updated_at';
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class CertificatePersistenceError extends Error {
  constructor(message = 'تعذر حفظ بيانات الشهادات في Supabase. تأكد من تطبيق ترحيل قاعدة البيانات ثم حاول مرة أخرى.') {
    super(message);
    this.name = 'CertificatePersistenceError';
  }
}

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function numberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function formatArabicDate(date: Date): string {
  const arabicMonths = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  return `${date.getDate()} ${arabicMonths[date.getMonth()]} ${date.getFullYear()}`;
}

function deterministicLegacyUuid(scope: string, value: string): string {
  const hex = createHash('sha256').update(`sustainable-pulse:${scope}:${value}`).digest('hex').slice(0, 32);
  const variant = ((Number.parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20)}`;
}

function templatePayload(template: CertificateTemplate, legacyId?: string): JsonRecord {
  return {
    ...(legacyId ? { legacyId } : {}),
    courseId: template.courseId || '',
    bgType: template.bgType,
    bgPreset: template.bgPreset,
    headerTitle: template.headerTitle,
    subtitle: template.subtitle,
    statement: template.statement,
    bodyText: template.bodyText,
    issuerName: template.issuerName,
    signatory1Title: template.signatory1Title,
    signatory1Name: template.signatory1Name,
    signatory2Title: template.signatory2Title,
    signatory2Name: template.signatory2Name,
    showQrCode: template.showQrCode,
    showNationalSeal: template.showNationalSeal,
    showInstituteSeal: template.showInstituteSeal,
    accentColor: template.accentColor,
    elementsLayout: template.elementsLayout || DEFAULT_CERTIFICATE_ELEMENTS,
    issuedCount: template.issuedCount,
  };
}

function toTemplate(row: CertificateTemplateRow): CertificateTemplate {
  const payload = isRecord(row.payload) ? row.payload : {};
  const bgType = stringValue(payload.bgType, 'image');
  const bgPreset = stringValue(payload.bgPreset, 'royal-gold');

  return {
    id: row.id,
    name: row.name,
    courseTitle: row.course_title || stringValue(payload.courseTitle, 'كافة الدورات التدريبية'),
    courseId: stringValue(payload.courseId) || undefined,
    bgType: ['image', 'preset', 'custom'].includes(bgType)
      ? bgType as CertificateTemplate['bgType']
      : 'image',
    bgPreset: ['royal-gold', 'emerald-official', 'classic-navy', 'modern-clean'].includes(bgPreset)
      ? bgPreset as CertificateTemplate['bgPreset']
      : 'royal-gold',
    imageUrl: row.image_url || stringValue(payload.imageUrl, '/1.png'),
    headerTitle: stringValue(payload.headerTitle, 'شهادة إتمام وتفوق معتمدة'),
    subtitle: stringValue(payload.subtitle, 'CERTIFICATE OF ACHIEVEMENT'),
    statement: stringValue(payload.statement, 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:'),
    bodyText: stringValue(payload.bodyText, 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها المعتمدة بنجاح.'),
    issuerName: stringValue(payload.issuerName, 'معهد النبض المستدام العالي للتدريب'),
    signatory1Title: stringValue(payload.signatory1Title, 'المشرف الأكاديمي والتدريب'),
    signatory1Name: stringValue(payload.signatory1Name, 'د. عبدالرحمن الغامدي'),
    signatory2Title: stringValue(payload.signatory2Title, 'المدير التنفيذي للمعهد'),
    signatory2Name: stringValue(payload.signatory2Name, 'أ. نورة الشمري'),
    showQrCode: booleanValue(payload.showQrCode, true),
    showNationalSeal: booleanValue(payload.showNationalSeal, true),
    showInstituteSeal: booleanValue(payload.showInstituteSeal, true),
    accentColor: stringValue(payload.accentColor, '#173A7C'),
    autoIssue: row.auto_issue ?? booleanValue(payload.autoIssue, true),
    elementsLayout: Array.isArray(payload.elementsLayout)
      ? payload.elementsLayout as CertificateCanvasElement[]
      : DEFAULT_CERTIFICATE_ELEMENTS,
    issuedCount: numberValue(payload.issuedCount),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toIssuedCertificate(row: IssuedCertificateRow): IssuedCertificate {
  const payload = isRecord(row.payload) ? row.payload : {};
  const issuedAt = row.issued_at || new Date().toISOString();

  return {
    id: row.id,
    code: row.certificate_code,
    studentName: stringValue(payload.studentName, 'المتدرب'),
    studentEmail: stringValue(payload.studentEmail) || undefined,
    courseTitle: stringValue(payload.courseTitle, 'دورة تدريبية معتمدة'),
    templateId: row.template_id || undefined,
    issueDate: stringValue(payload.issueDate, formatArabicDate(new Date(issuedAt))),
    grade: stringValue(payload.grade, 'ممتاز'),
    hours: stringValue(payload.hours, '30 ساعة'),
    status: row.status === 'revoked' ? 'revoked' : 'active',
    imageUrl: stringValue(payload.imageUrl, row.pdf_url || '/1.png'),
    customData: isRecord(payload.customData) ? payload.customData : undefined,
    createdAt: issuedAt,
  };
}

function persistenceFailure(event: string, error: unknown): never {
  logger.error(event, { error });
  throw new CertificatePersistenceError();
}

const legacyDatabase = legacyCertificatesDatabase as unknown as {
  templates?: CertificateTemplate[];
  issued?: IssuedCertificate[];
};

let legacySeedPromise: Promise<void> | null = null;

async function seedLegacyData(): Promise<void> {
  const supabase = getSupabaseAdmin();
  const templates = Array.isArray(legacyDatabase.templates) ? legacyDatabase.templates : [];
  const issued = Array.isArray(legacyDatabase.issued) ? legacyDatabase.issued : [];
  const templateIdMap = new Map<string, string>();

  if (templates.length > 0) {
    const rows = templates.map((template) => {
      const id = deterministicLegacyUuid('template', template.id || template.name);
      templateIdMap.set(template.id, id);
      return {
        id,
        name: template.name,
        course_title: template.courseTitle || 'كافة الدورات التدريبية',
        image_url: template.imageUrl || '/1.png',
        auto_issue: template.autoIssue ?? true,
        payload: templatePayload(template, template.id),
        created_at: template.createdAt || new Date().toISOString(),
        updated_at: template.updatedAt || template.createdAt || new Date().toISOString(),
      };
    });

    const { error } = await supabase
      .from('certificate_templates')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: true });
    if (error) persistenceFailure('certificates.legacy_template_seed_failed', error);
  }

  if (issued.length > 0) {
    const rows = issued.map((certificate) => ({
      id: deterministicLegacyUuid('issued', certificate.id || certificate.code),
      certificate_code: certificate.code,
      issued_at: certificate.createdAt || new Date().toISOString(),
      template_id: certificate.templateId ? templateIdMap.get(certificate.templateId) || null : null,
      status: certificate.status === 'revoked' ? 'revoked' : 'active',
      payload: {
        legacyId: certificate.id,
        studentName: certificate.studentName,
        studentEmail: certificate.studentEmail || '',
        courseTitle: certificate.courseTitle,
        issueDate: certificate.issueDate,
        grade: certificate.grade,
        hours: certificate.hours,
        imageUrl: certificate.imageUrl,
        customData: certificate.customData || {},
      },
      updated_at: certificate.createdAt || new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('certificates')
      .upsert(rows, { onConflict: 'certificate_code', ignoreDuplicates: true });
    if (error) persistenceFailure('certificates.legacy_issued_seed_failed', error);
  }

  logger.info('certificates.legacy_seed_checked', {
    templateCount: templates.length,
    issuedCount: issued.length,
  });
}

async function ensureLegacyDataSeeded(): Promise<void> {
  if (!legacySeedPromise) {
    legacySeedPromise = seedLegacyData().catch((error) => {
      legacySeedPromise = null;
      throw error;
    });
  }
  await legacySeedPromise;
}

export async function getAllTemplates(): Promise<CertificateTemplate[]> {
  await ensureLegacyDataSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from('certificate_templates')
    .select(TEMPLATE_COLUMNS)
    .order('updated_at', { ascending: false });

  if (error) persistenceFailure('certificates.templates_read_failed', error);
  return (data || []).map((row) => toTemplate(row as CertificateTemplateRow));
}

export async function getTemplateById(id: string): Promise<CertificateTemplate | undefined> {
  await ensureLegacyDataSeeded();
  let query = getSupabaseAdmin().from('certificate_templates').select(TEMPLATE_COLUMNS);
  query = UUID_PATTERN.test(id)
    ? query.eq('id', id)
    : query.eq('payload->>legacyId', id);

  const { data, error } = await query.maybeSingle();
  if (error) persistenceFailure('certificates.template_read_failed', error);
  return data ? toTemplate(data as CertificateTemplateRow) : undefined;
}

export async function saveTemplate(
  templateData: Partial<CertificateTemplate> & { name: string },
  actorId?: string,
): Promise<CertificateTemplate> {
  await ensureLegacyDataSeeded();
  const now = new Date().toISOString();
  const existing = templateData.id ? await getTemplateById(templateData.id) : undefined;
  const template: CertificateTemplate = {
    id: existing?.id || '',
    name: templateData.name.trim(),
    courseTitle: templateData.courseTitle || existing?.courseTitle || 'كافة الدورات التدريبية',
    courseId: templateData.courseId ?? existing?.courseId ?? '',
    bgType: templateData.bgType || existing?.bgType || 'image',
    bgPreset: templateData.bgPreset || existing?.bgPreset || 'royal-gold',
    imageUrl: templateData.imageUrl || existing?.imageUrl || '/1.png',
    headerTitle: templateData.headerTitle || existing?.headerTitle || 'شهادة إتمام وتفوق معتمدة',
    subtitle: templateData.subtitle || existing?.subtitle || 'CERTIFICATE OF ACHIEVEMENT',
    statement: templateData.statement || existing?.statement || 'يشهد معهد النبض المستدام العالي للتدريب بأن المتدرب/ـة:',
    bodyText: templateData.bodyText || existing?.bodyText || 'قد اجتاز/ت بنجاح متطلبات الدورة التدريبية واكتملت كافة ساعاتها المعتمدة بنجاح.',
    issuerName: templateData.issuerName || existing?.issuerName || 'معهد النبض المستدام العالي للتدريب',
    signatory1Title: templateData.signatory1Title || existing?.signatory1Title || 'المشرف الأكاديمي والتدريب',
    signatory1Name: templateData.signatory1Name || existing?.signatory1Name || 'د. عبدالرحمن الغامدي',
    signatory2Title: templateData.signatory2Title || existing?.signatory2Title || 'المدير التنفيذي للمعهد',
    signatory2Name: templateData.signatory2Name || existing?.signatory2Name || 'أ. نورة الشمري',
    showQrCode: templateData.showQrCode ?? existing?.showQrCode ?? true,
    showNationalSeal: templateData.showNationalSeal ?? existing?.showNationalSeal ?? true,
    showInstituteSeal: templateData.showInstituteSeal ?? existing?.showInstituteSeal ?? true,
    accentColor: templateData.accentColor || existing?.accentColor || '#173A7C',
    autoIssue: templateData.autoIssue ?? existing?.autoIssue ?? true,
    elementsLayout: templateData.elementsLayout || existing?.elementsLayout || DEFAULT_CERTIFICATE_ELEMENTS,
    issuedCount: templateData.issuedCount ?? existing?.issuedCount ?? 0,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  const values = {
    name: template.name,
    course_title: template.courseTitle,
    image_url: template.imageUrl,
    auto_issue: template.autoIssue,
    payload: templatePayload(template),
    updated_at: now,
  };

  const query = existing
    ? getSupabaseAdmin().from('certificate_templates').update(values).eq('id', existing.id)
    : getSupabaseAdmin().from('certificate_templates').insert({
        ...values,
        ...(actorId ? { created_by: actorId } : {}),
        created_at: now,
      });
  const { data, error } = await query.select(TEMPLATE_COLUMNS).single();

  if (error || !data) persistenceFailure('certificates.template_write_failed', error);
  return toTemplate(data as CertificateTemplateRow);
}

export async function deleteTemplate(id: string): Promise<boolean> {
  await ensureLegacyDataSeeded();
  const template = await getTemplateById(id);
  if (!template) return false;

  const { data, error } = await getSupabaseAdmin()
    .from('certificate_templates')
    .delete()
    .eq('id', template.id)
    .select('id')
    .maybeSingle();
  if (error) persistenceFailure('certificates.template_delete_failed', error);
  return Boolean(data);
}

export async function getAllIssuedCertificates(): Promise<IssuedCertificate[]> {
  await ensureLegacyDataSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from('certificates')
    .select(CERTIFICATE_COLUMNS)
    .order('issued_at', { ascending: false });

  if (error) persistenceFailure('certificates.issued_read_failed', error);
  return (data || []).map((row) => toIssuedCertificate(row as IssuedCertificateRow));
}

async function incrementTemplateIssuedCount(template: CertificateTemplate): Promise<void> {
  const nextTemplate = { ...template, issuedCount: template.issuedCount + 1 };
  const { error } = await getSupabaseAdmin()
    .from('certificate_templates')
    .update({ payload: templatePayload(nextTemplate), updated_at: new Date().toISOString() })
    .eq('id', template.id);
  if (error) logger.warn('certificates.template_count_update_failed', { error, templateId: template.id });
}

export async function issueCertificate(certData: CertificateInput): Promise<IssuedCertificate> {
  await ensureLegacyDataSeeded();
  const now = new Date();
  const template = certData.templateId ? await getTemplateById(certData.templateId) : undefined;
  const imageUrl = certData.imageUrl || template?.imageUrl || '/1.png';
  const payload = {
    studentName: certData.studentName.trim(),
    studentEmail: certData.studentEmail?.trim().toLowerCase() || '',
    courseTitle: certData.courseTitle.trim(),
    issueDate: formatArabicDate(now),
    grade: certData.grade || 'ممتاز مرتفع (%99)',
    hours: certData.hours || '30 ساعة',
    imageUrl,
    customData: certData.customData || {},
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `SA-TTI-${now.getFullYear()}-${randomInt(10000, 100000)}`;
    const { data, error } = await getSupabaseAdmin()
      .from('certificates')
      .insert({
        certificate_code: code,
        issued_at: now.toISOString(),
        template_id: template?.id || null,
        status: 'active',
        payload,
        updated_at: now.toISOString(),
      })
      .select(CERTIFICATE_COLUMNS)
      .single();

    if (!error && data) {
      if (template) await incrementTemplateIssuedCount(template);
      return toIssuedCertificate(data as IssuedCertificateRow);
    }

    if (error?.code !== '23505') {
      persistenceFailure('certificates.issue_failed', error);
    }
  }

  throw new CertificatePersistenceError('تعذر إنشاء رقم شهادة فريد. حاول مرة أخرى.');
}

export async function toggleCertificateStatus(id: string): Promise<IssuedCertificate | null> {
  await ensureLegacyDataSeeded();
  const { data: current, error: readError } = await getSupabaseAdmin()
    .from('certificates')
    .select(CERTIFICATE_COLUMNS)
    .eq('id', id)
    .maybeSingle();
  if (readError) persistenceFailure('certificates.status_read_failed', readError);
  if (!current) return null;

  const nextStatus = current.status === 'active' ? 'revoked' : 'active';
  const { data, error } = await getSupabaseAdmin()
    .from('certificates')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(CERTIFICATE_COLUMNS)
    .single();
  if (error || !data) persistenceFailure('certificates.status_write_failed', error);
  return toIssuedCertificate(data as IssuedCertificateRow);
}

export async function deleteIssuedCertificate(id: string): Promise<boolean> {
  await ensureLegacyDataSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from('certificates')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();
  if (error) persistenceFailure('certificates.issued_delete_failed', error);
  return Boolean(data);
}

export async function getCertificateByCode(code: string): Promise<IssuedCertificate | undefined> {
  await ensureLegacyDataSeeded();
  const { data, error } = await getSupabaseAdmin()
    .from('certificates')
    .select(CERTIFICATE_COLUMNS)
    .ilike('certificate_code', code.trim())
    .maybeSingle();
  if (error) persistenceFailure('certificates.code_lookup_failed', error);
  return data ? toIssuedCertificate(data as IssuedCertificateRow) : undefined;
}
