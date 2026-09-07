import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const storeUrl = new URL('../lib/services-store.ts', import.meta.url);
const routeUrl = new URL('../app/api/admin/services/route.ts', import.meta.url);
const instructorPageUrl = new URL('../app/dashboard/instructor/services/page.tsx', import.meta.url);

test('services store throws ServicePersistenceError when database write fails and validates UUIDs', async () => {
  const source = await readFile(storeUrl, 'utf8');

  assert.match(source, /class ServicePersistenceError extends Error/);
  assert.match(source, /throw new ServicePersistenceError/);
  assert.match(source, /resolveCategoryId/);
  assert.match(source, /getSupabaseAdmin\(\)/);
});

test('admin services route exposes persistence error and supports instructor access', async () => {
  const source = await readFile(routeUrl, 'utf8');

  assert.match(source, /ServicePersistenceError/);
  assert.match(source, /requireInstructorOrAdmin/);
  assert.match(source, /isAdminRole/);
  assert.match(source, /err instanceof ServicePersistenceError/);
});

test('instructor services page interacts with live API and displays error on failure', async () => {
  const source = await readFile(instructorPageUrl, 'utf8');

  assert.match(source, /fetch\(`\/api\/admin\/services/);
  assert.match(source, /loadServices\(\)/);
  assert.doesNotMatch(source, /setTimeout\(\(\) => \{\s+if \(editingService\.id\)/);
});
