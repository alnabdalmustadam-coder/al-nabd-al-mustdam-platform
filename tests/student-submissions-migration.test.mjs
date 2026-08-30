import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const migrationUrl = new URL(
  '../supabase/migrations/20260831_student_submissions_and_enrollment_rls.sql',
  import.meta.url,
);

test('student submissions bucket is private and size-limited', async () => {
  const sql = await readFile(migrationUrl, 'utf8');

  assert.match(sql, /'student-submissions'[\s\S]*?false,[\s\S]*?26214400/);
  assert.doesNotMatch(sql, /CREATE\s+POLICY[\s\S]*?storage\.objects/i);
});

test('assignments and course sessions require a trusted enrollment', async () => {
  const sql = await readFile(migrationUrl, 'utf8');

  assert.match(sql, /CREATE POLICY "Students view enrolled assignments"/);
  assert.match(sql, /current_user_is_enrolled\(course_id::TEXT\)/);
  assert.match(sql, /CREATE POLICY "Students view enrolled live sessions"/);
  assert.match(sql, /REVOKE ALL ON FUNCTION[^;]+FROM PUBLIC, anon/);
});
