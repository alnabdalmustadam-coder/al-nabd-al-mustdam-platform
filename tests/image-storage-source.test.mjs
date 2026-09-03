import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const courseRouteUrl = new URL(
  '../app/api/admin/courses/upload-image/route.ts',
  import.meta.url,
);
const universalRouteUrl = new URL(
  '../app/api/admin/upload-image/route.ts',
  import.meta.url,
);
const storageHelperUrl = new URL(
  '../lib/media/public-image-storage.ts',
  import.meta.url,
);

test('image upload routes persist to Supabase instead of the deployment filesystem', async () => {
  const routes = await Promise.all([
    readFile(courseRouteUrl, 'utf8'),
    readFile(universalRouteUrl, 'utf8'),
  ]);

  for (const source of routes) {
    assert.match(source, /uploadPublicWebp/);
    assert.match(source, /export const runtime = 'nodejs'/);
    assert.doesNotMatch(source, /(?:mkdir|writeFile|public["',\s]+uploads)/);
    assert.doesNotMatch(source, /from ['"](?:node:)?fs['"]/);
  }
});

test('public image storage reports upload errors and provisions the fixed bucket', async () => {
  const source = await readFile(storageHelperUrl, 'utf8');

  assert.match(source, /storage\.getBucket\(bucketName\)/);
  assert.match(source, /storage\.createBucket/);
  assert.match(source, /if \(error \|\| !data\)/);
  assert.match(source, /تعذر حفظ الصورة في قاعدة البيانات/);
  assert.doesNotMatch(source, /throw new Error\([^\n]*Supabase/);
});
