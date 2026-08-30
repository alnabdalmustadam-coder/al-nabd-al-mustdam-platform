import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDashboardUrlForRole,
  getTrustedRole,
  isAdminRole,
  isInstructorRole,
} from '../lib/security/roles.ts';

test('user-controlled metadata cannot promote an account', () => {
  const role = getTrustedRole({
    app_metadata: {},
    user_metadata: { role: 'ADMIN' },
  });

  assert.equal(role, 'STUDENT');
  assert.equal(isAdminRole(role), false);
  assert.equal(getDashboardUrlForRole(role), '/dashboard/student');
});

test('trusted app metadata grants normalized staff roles', () => {
  const adminRole = getTrustedRole({ app_metadata: { role: 'admin' } });
  const instructorRole = getTrustedRole({ app_metadata: { role: 'trainer' } });

  assert.equal(adminRole, 'ADMIN');
  assert.equal(isAdminRole(adminRole), true);
  assert.equal(instructorRole, 'TRAINER');
  assert.equal(isInstructorRole(instructorRole), true);
  assert.equal(getDashboardUrlForRole(instructorRole), '/dashboard/instructor');
});

test('unknown or missing trusted claims fail closed to student', () => {
  assert.equal(getTrustedRole(null), 'STUDENT');
  assert.equal(getTrustedRole({ app_metadata: { role: 'OWNER' } }), 'STUDENT');
});
