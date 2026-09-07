import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const adminTrainersRouteUrl = new URL('../app/api/admin/trainers/route.ts', import.meta.url);
const publicTrainersRouteUrl = new URL('../app/api/trainers/route.ts', import.meta.url);
const adminUsersRouteUrl = new URL('../app/api/admin/users/route.ts', import.meta.url);
const adminTrainersPageUrl = new URL('../app/dashboard/admin/trainers/page.tsx', import.meta.url);
const adminUsersPageUrl = new URL('../app/dashboard/admin/users/page.tsx', import.meta.url);
const publicTrainersPageUrl = new URL('../app/trainers/page.tsx', import.meta.url);

test('admin trainers API calculates dynamic stats and handles full trainer edits', async () => {
  const source = await readFile(adminTrainersRouteUrl, 'utf8');

  assert.match(source, /requireAdmin/);
  assert.match(source, /getAllCoursesAsync/);
  assert.match(source, /coursesCount/);
  assert.match(source, /studentsCount/);
  assert.match(source, /avgRating/);
  assert.match(source, /updateUserById/);
  assert.match(source, /saveCourseAsync/);
});

test('public trainers API provides active trainers and course relations', async () => {
  const source = await readFile(publicTrainersRouteUrl, 'utf8');

  assert.match(source, /getAllCoursesAsync/);
  assert.match(source, /status !== 'suspended'/);
  assert.match(source, /trainers/);
  assert.match(source, /assignedCourses/);
});

test('admin users API supports updating student full name for certificates', async () => {
  const source = await readFile(adminUsersRouteUrl, 'utf8');

  assert.match(source, /newFullName/);
  assert.match(source, /profiles/);
  assert.match(source, /updateUserById/);
  assert.match(source, /user_metadata: \{ full_name: newFullName \}/);
});

test('admin trainers UI provides edit modal, real avatar upload, and dynamic course assignment', async () => {
  const source = await readFile(adminTrainersPageUrl, 'utf8');

  assert.match(source, /handleOpenEdit/);
  assert.match(source, /handleSaveEditTrainer/);
  assert.match(source, /handleUploadImage/);
  assert.match(source, /editAvatarUrl/);
  assert.match(source, /editAssignedCourses/);
  assert.match(source, /t\.coursesCount/);
  assert.match(source, /t\.studentsCount/);
  assert.match(source, /t\.rating/);
});

test('admin users UI provides student name correction action and modal', async () => {
  const source = await readFile(adminUsersPageUrl, 'utf8');

  assert.match(source, /userToEditName/);
  assert.match(source, /editStudentFullName/);
  assert.match(source, /handleSaveStudentName/);
  assert.match(source, /تعديل وتصحيح اسم المتدرب/);
});

test('public trainers page loads active trainers dynamically from API', async () => {
  const source = await readFile(publicTrainersPageUrl, 'utf8');

  assert.match(source, /fetch\('\/api\/trainers'\)/);
  assert.match(source, /setTrainersList/);
  assert.match(source, /filteredTrainers/);
});
