import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const storeUrl = new URL('../lib/courses-store.ts', import.meta.url);
const adminCoursesPageUrl = new URL('../app/dashboard/admin/courses/page.tsx', import.meta.url);
const authUrl = new URL('../lib/security/auth.ts', import.meta.url);

test('course publishing fails visibly when Supabase does not persist the row', async () => {
  const source = await readFile(storeUrl, 'utf8');

  assert.match(source, /if \(error \|\| !data\)/);
  assert.match(source, /throw new CoursePersistenceError/);
  assert.match(source, /upsert\(values, \{ onConflict: 'slug' \}\)/);
  assert.doesNotMatch(source, /savedCourse \|\| \{/);
  assert.match(source, /process\.env\.NODE_ENV !== 'production'/);
});

test('admin course UI displays authorization messages returned by the API', async () => {
  const [pageSource, authSource] = await Promise.all([
    readFile(adminCoursesPageUrl, 'utf8'),
    readFile(authUrl, 'utf8'),
  ]);

  assert.match(pageSource, /data\.error \|\| data\.message/);
  assert.match(authSource, /\{ success: false, error: message, message \}/);
});
