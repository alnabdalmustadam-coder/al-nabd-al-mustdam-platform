import { NextRequest, NextResponse } from 'next/server';
import {
  getAllIssuedCertificates,
  getAllTemplates,
  issueCertificate,
  CertificateTemplate,
  IssuedCertificate,
} from '@/lib/certificates-store';
import { createClient } from '@/utils/supabase/server';
import { supabase as adminSupabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const queryEmail = searchParams.get('email')?.toLowerCase().trim();
    const queryName = searchParams.get('name')?.trim();

    // 1. Identify student from Supabase auth session or query
    let studentEmail = queryEmail || '';
    let studentName = queryName || '';

    try {
      const supabase = await createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        studentEmail = studentEmail || authData.user.email?.toLowerCase().trim() || '';
        if (authData.user.user_metadata?.full_name) {
          studentName = studentName || authData.user.user_metadata.full_name;
        }

        // Check profile table for full_name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authData.user.id)
          .maybeSingle();

        if (profile?.full_name) {
          studentName = profile.full_name;
        }
      }
    } catch (authErr) {
      console.warn('Auth session check skipped or failed in student certificates GET:', authErr);
    }

    if (!studentName && !studentEmail) {
      studentName = 'المتدرب';
    }

    const allTemplates = getAllTemplates();
    const allIssued = getAllIssuedCertificates();

    // 2. Check for completed enrollments to auto-issue any pending certificates
    if (studentEmail) {
      try {
        const { data: enrollments } = await adminSupabase
          .from('enrollments')
          .select('*')
          .eq('email', studentEmail);

        if (enrollments && enrollments.length > 0) {
          for (const enroll of enrollments) {
            const isFinished = (enroll.progress && Number(enroll.progress) >= 100) || enroll.status === 'completed';
            if (isFinished) {
              const courseTitle = enroll.course_title || enroll.course_id || 'دورة تدريبية معتمدة';
              
              // Check if already issued for this student & course
              const alreadyIssued = allIssued.some(
                (c) =>
                  (c.studentEmail?.toLowerCase() === studentEmail || c.studentName === studentName) &&
                  (c.courseTitle.toLowerCase().trim() === courseTitle.toLowerCase().trim() ||
                   c.courseTitle.includes(courseTitle) ||
                   courseTitle.includes(c.courseTitle))
              );

              if (!alreadyIssued) {
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

                issueCertificate({
                  studentName: studentName || 'المتدرب المتميز',
                  studentEmail: studentEmail,
                  courseTitle: courseTitle,
                  templateId: matchedTemplate ? matchedTemplate.id : 'tpl-1',
                  grade: 'ممتاز مرتفع (%98)',
                  hours: '30 ساعة تدريبية',
                  imageUrl: matchedTemplate?.imageUrl || '/1.png',
                });
              }
            }
          }
        }
      } catch (enrollErr) {
        console.error('Error checking enrollments for auto certificate issuance:', enrollErr);
      }
    }

    // 3. Refresh issued list from store after potential auto-issue
    const freshIssued = getAllIssuedCertificates();

    // 4. Filter certificates for this student
    let userCertificates = freshIssued.filter((cert) => {
      if (studentEmail && cert.studentEmail?.toLowerCase().trim() === studentEmail) {
        return true;
      }
      if (studentName && cert.studentName && (cert.studentName === studentName || cert.studentName.includes(studentName) || studentName.includes(cert.studentName))) {
        return true;
      }
      return false;
    });

    // If user has no specific issued certs and no user was logged in, return all active ones for demonstration / preview
    if (userCertificates.length === 0 && (!studentEmail || studentEmail === '')) {
      userCertificates = freshIssued.filter((c) => c.status === 'active');
    }

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
  } catch (err: any) {
    console.error('Error in student certificates GET route:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
