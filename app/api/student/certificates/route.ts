import { NextRequest, NextResponse } from 'next/server';
import {
  CertificatePersistenceError,
  getAllIssuedCertificates,
  getAllTemplates,
  issueCertificate,
  formatCertificateGrade,
  formatCertificateHours,
} from '@/lib/certificates-store';
import { getAllCoursesAsync } from '@/lib/courses-store';
import { findCourseByIdentifier } from '@/lib/public-courses';
import { getCourseBySlug } from '@/data/courses';
import { supabase as adminSupabase } from '@/lib/supabase';
import { requireUser } from '@/lib/security/auth';

export const dynamic = 'force-dynamic';

function normalizeEmail(value?: string | null): string {
  return value?.trim().toLowerCase() || '';
}

function normalizeCourseTitle(value?: string | null): string {
  return value?.trim().toLowerCase() || '';
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;

    const studentEmail = normalizeEmail(auth.user.email);
    if (!studentEmail) {
      return NextResponse.json(
        { success: false, error: 'الحساب لا يحتوي على بريد إلكتروني موثق' },
        { status: 400 },
      );
    }

    // 1. Fetch templates & issued certificates
    const [allTemplates, initialIssued] = await Promise.all([
      getAllTemplates(),
      getAllIssuedCertificates(),
    ]);

    let studentName = auth.user.user_metadata?.full_name || '';

    // 2. Check if the user has completed enrollments in Supabase
    // If completed and no certificate exists, auto-issue one!
    try {
      const { data: profile } = await adminSupabase
        .from('profiles')
        .select('full_name')
        .eq('id', auth.user.id)
        .maybeSingle();

      if (profile?.full_name) {
        studentName = profile.full_name;
      }

      const { data: enrollments } = await adminSupabase
        .from('enrollments')
        .select('*')
        .eq('email', studentEmail);

      const issuedCourseTitles = new Set(
        initialIssued
          .filter((c) => normalizeEmail(c.studentEmail) === studentEmail)
          .map((c) => normalizeCourseTitle(c.courseTitle)),
      );

      if (enrollments && enrollments.length > 0) {
        const allCourses = await getAllCoursesAsync();
        for (const enroll of enrollments) {
          const isFinished = (enroll.progress && Number(enroll.progress) >= 100) || enroll.status === 'completed';
          if (isFinished) {
            const courseTitle = enroll.course_title || enroll.course_id || 'دورة تدريبية معتمدة';
            const normalizedCourseTitle = normalizeCourseTitle(courseTitle);
            const alreadyIssued = issuedCourseTitles.has(normalizedCourseTitle);

            if (!alreadyIssued) {
              const matchedCourse =
                findCourseByIdentifier(allCourses, enroll.course_id) ||
                allCourses.find((c) => c.title === courseTitle) ||
                getCourseBySlug(enroll.course_id);

              // Find best matching template
              const matchedTemplate =
                allTemplates.find(
                  (t) =>
                    t.courseTitle.toLowerCase().trim() === courseTitle.toLowerCase().trim() ||
                    courseTitle.toLowerCase().includes(t.courseTitle.toLowerCase()) ||
                    t.courseTitle.toLowerCase().includes(courseTitle.toLowerCase())
                ) ||
                allTemplates.find((t) => t.autoIssue) ||
                allTemplates[0];

              const issuedCertificate = await issueCertificate({
                studentName: studentName || 'المتدرب المتميز',
                studentEmail,
                courseTitle,
                templateId: matchedTemplate ? matchedTemplate.id : 'tpl-1',
                grade: formatCertificateGrade(null, enroll.grade),
                hours: formatCertificateHours(matchedCourse?.duration, enroll.hours),
                imageUrl: matchedTemplate?.imageUrl || '/1.png',
              });
              issuedCourseTitles.add(normalizeCourseTitle(issuedCertificate.courseTitle));
            }
          }
        }
      }
    } catch (enrollErr) {
      console.error('Error checking enrollments for auto certificate issuance:', enrollErr);
    }

    // 3. Refresh issued list from store after potential auto-issue
    const freshIssued = await getAllIssuedCertificates();

    // 4. Filter certificates for this student
    // Certificate ownership is based exclusively on the authenticated account.
    // Never fall back to a profile name because students can edit their names.
    const userCertificates = freshIssued.filter(
      (certificate) => normalizeEmail(certificate.studentEmail) === studentEmail,
    );

    // 5. Enrich certificates with full template configuration
    const enrichedCertificates = userCertificates.map((cert) => {
      const template = allTemplates.find((t) => t.id === cert.templateId) || allTemplates[0] || null;
      return {
        ...cert,
        template,
        imageUrl: template?.imageUrl || cert.imageUrl || '/1.png',
      };
    });

    return NextResponse.json({
      success: true,
      studentName,
      studentEmail,
      certificates: enrichedCertificates,
      templates: allTemplates,
    });
  } catch (err: unknown) {
    console.error('Error in student certificates GET route:', err);
    const message = err instanceof Error ? err.message : 'تعذر تحميل الشهادات';
    return NextResponse.json(
      { success: false, error: message },
      { status: err instanceof CertificatePersistenceError ? 503 : 500 },
    );
  }
}
