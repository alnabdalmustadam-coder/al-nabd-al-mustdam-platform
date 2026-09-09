type CertificateEnrollment = {
  user_id?: string | null;
  email?: string | null;
  status?: string | null;
  progress?: number | string | null;
};

type CertificateStudent = { id: string; email?: string | null };

/** Only server-recorded completion can authorize automatic issuance. */
export function isCertificateEnrollmentEligible(
  enrollment: CertificateEnrollment | null | undefined,
  student: CertificateStudent,
): boolean {
  if (!enrollment) return false;

  const email = student.email?.trim().toLowerCase();
  if (!email || enrollment.email?.trim().toLowerCase() !== email) return false;
  // Email-only legacy records are supported, but must not override an owner ID.
  if (enrollment.user_id && enrollment.user_id !== student.id) return false;

  const status = enrollment.status?.trim().toLowerCase() || 'active';
  if (status === 'completed') return true;
  if (status !== 'active') return false;

  const progress = Number(enrollment.progress);
  return Number.isFinite(progress) && progress >= 100;
}
