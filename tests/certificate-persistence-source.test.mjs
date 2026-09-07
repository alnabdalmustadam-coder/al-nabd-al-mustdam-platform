import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const storeUrl = new URL('../lib/certificates-store.ts', import.meta.url);
const adminRouteUrl = new URL('../app/api/admin/certificates/route.ts', import.meta.url);
const adminIssueRouteUrl = new URL('../app/api/admin/certificates/issue/route.ts', import.meta.url);
const studentRouteUrl = new URL('../app/api/student/certificates/route.ts', import.meta.url);
const autoIssueRouteUrl = new URL('../app/api/student/certificates/auto-issue/route.ts', import.meta.url);
const uploadRouteUrl = new URL('../app/api/admin/certificates/upload-template/route.ts', import.meta.url);
const migrationUrl = new URL('../supabase/migrations/20260903_certificate_supabase_persistence.sql', import.meta.url);

test('certificate records use Supabase as the only durable database', async () => {
  const source = await readFile(storeUrl, 'utf8');

  assert.match(source, /from\('certificate_templates'\)/);
  assert.match(source, /from\('certificates'\)/);
  assert.match(source, /ensureLegacyDataSeeded/);
  assert.match(source, /throw new CertificatePersistenceError/);
  assert.doesNotMatch(source, /from 'fs'/);
  assert.doesNotMatch(source, /writeFileSync|DB_FILE_PATH|writeDbFile/);
});

test('all certificate route mutations await durable writes', async () => {
  const [admin, adminIssue, student, autoIssue] = await Promise.all([
    readFile(adminRouteUrl, 'utf8'),
    readFile(adminIssueRouteUrl, 'utf8'),
    readFile(studentRouteUrl, 'utf8'),
    readFile(autoIssueRouteUrl, 'utf8'),
  ]);

  assert.match(admin, /await saveTemplate/);
  assert.match(admin, /await deleteTemplate/);
  assert.match(adminIssue, /await issueCertificate/);
  assert.match(adminIssue, /await toggleCertificateStatus/);
  assert.match(adminIssue, /await deleteIssuedCertificate/);
  assert.match(student, /await issueCertificate/);
  assert.match(autoIssue, /await issueCertificate/);
});

test('certificate images persist only in Supabase Storage', async () => {
  const source = await readFile(uploadRouteUrl, 'utf8');

  assert.match(source, /uploadPublicWebp/);
  assert.match(source, /certificate-templates/);
  assert.doesNotMatch(source, /from 'fs'|writeFileSync|public.*uploads.*certificates/);
});

test('certificate persistence migration is idempotent and secured', async () => {
  const migration = await readFile(migrationUrl, 'utf8');

  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.certificate_templates/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.certificates/);
  assert.match(migration, /payload jsonb/);
  assert.match(migration, /ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL ON public\.certificate_templates, public\.certificates FROM anon/);
});

test('certificate auto-issuance and store derive authentic grades and hours without hardcoded defaults', async () => {
  const [storeSource, autoIssueSource, studentRouteSource, adminIssueSource, lessonPlayerSource] = await Promise.all([
    readFile(storeUrl, 'utf8'),
    readFile(autoIssueRouteUrl, 'utf8'),
    readFile(studentRouteUrl, 'utf8'),
    readFile(adminIssueRouteUrl, 'utf8'),
    readFile(new URL('../app/dashboard/student/courses/[courseSlug]/lessons/[lessonId]/page.tsx', import.meta.url), 'utf8'),
  ]);

  // Store defines dynamic formatting helpers
  assert.match(storeSource, /export function formatCertificateGrade/);
  assert.match(storeSource, /export function formatCertificateHours/);
  assert.doesNotMatch(storeSource, /'ممتاز مرتفع \(%99\)'/);

  // Auto-issue route verifies course completion / final assessment and dynamically calculates grade and hours
  assert.match(autoIssueSource, /formatCertificateGrade/);
  assert.match(autoIssueSource, /formatCertificateHours/);
  assert.match(autoIssueSource, /passedFinalAssessment/);
  assert.doesNotMatch(autoIssueSource, /'ممتاز مرتفع \(%98\)'/);
  assert.doesNotMatch(autoIssueSource, /'30 ساعة تدريبية معتمدة'/);

  // Student and Admin certificates routes use authentic grade & duration
  assert.doesNotMatch(studentRouteSource, /'ممتاز مرتفع \(%98\)'/);
  assert.doesNotMatch(adminIssueSource, /'ممتاز مرتفع \(%99\)'/);

  // Lesson player only triggers auto-issuance on course finish / final exam
  assert.match(lessonPlayerSource, /isCourseFinished/);
  assert.match(lessonPlayerSource, /isPassed && isCourseFinished/);
});
