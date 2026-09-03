import { NextRequest, NextResponse } from 'next/server';
import {
  CertificatePersistenceError,
  getAllIssuedCertificates,
  getAllTemplates,
  issueCertificate,
} from '@/lib/certificates-store';
import { requireUser } from '@/lib/security/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const {
      courseTitle,
      courseSlug,
    } = body;

    if (!courseTitle && !courseSlug) {
      return NextResponse.json(
        { success: false, error: 'عنوان الدورة مطلوب لإصدار الشهادة' },
        { status: 400 }
      );
    }

    const email = auth.user.email?.toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ success: false, error: 'البريد الإلكتروني غير متاح' }, { status: 400 });
    }

    const enrollmentIds = [courseSlug, courseSlug ? `course-${courseSlug.replace(/^course-/, '')}` : null]
      .filter(Boolean) as string[];
    let enrollmentQuery = supabase
      .from('enrollments')
      .select('course_id, course_title, progress, status')
      .eq('email', email);
    if (enrollmentIds.length > 0) enrollmentQuery = enrollmentQuery.in('course_id', enrollmentIds);
    else enrollmentQuery = enrollmentQuery.eq('course_title', courseTitle);
    const { data: enrollment } = await enrollmentQuery.maybeSingle();

    if (!enrollment || (Number(enrollment.progress) < 100 && enrollment.status !== 'completed')) {
      return NextResponse.json({ success: false, error: 'لا يمكن إصدار الشهادة قبل إكمال الدورة' }, { status: 403 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', auth.user.id)
      .maybeSingle();
    const name = profile?.full_name || auth.user.user_metadata?.full_name || 'المتدرب المتميز';
    const title = enrollment.course_title || courseTitle || 'الدورة التدريبية المعتمدة';

    const [allIssued, allTemplates] = await Promise.all([
      getAllIssuedCertificates(),
      getAllTemplates(),
    ]);

    // Check if certificate already exists
    const existing = allIssued.find(
      (c) =>
        (email ? c.studentEmail?.toLowerCase().trim() === email : c.studentName === name) &&
        (c.courseTitle.toLowerCase().trim() === title.toLowerCase().trim() ||
         c.courseTitle.includes(title) ||
         title.includes(c.courseTitle))
    );

    if (existing) {
      const template = allTemplates.find((t) => t.id === existing.templateId) || allTemplates[0];
      return NextResponse.json({
        success: true,
        alreadyIssued: true,
        certificate: {
          ...existing,
          template,
        },
      });
    }

    // Determine best template
    let targetTemplateId: string | undefined;
    if (!targetTemplateId) {
      const matchedTpl =
        allTemplates.find(
          (t) =>
            t.courseTitle.toLowerCase().trim() === title.toLowerCase().trim() ||
            title.toLowerCase().includes(t.courseTitle.toLowerCase()) ||
            t.courseTitle.toLowerCase().includes(title.toLowerCase())
        ) ||
        allTemplates.find((t) => t.autoIssue) ||
        allTemplates[0];

      targetTemplateId = matchedTpl ? matchedTpl.id : 'tpl-1';
    }

    const matchedTemplate = allTemplates.find((t) => t.id === targetTemplateId) || allTemplates[0];

    const newCert = await issueCertificate({
      studentName: name,
      studentEmail: email,
      courseTitle: title,
      templateId: targetTemplateId,
      grade: 'ممتاز مرتفع (%98)',
      hours: '30 ساعة تدريبية معتمدة',
      imageUrl: matchedTemplate?.imageUrl || '/1.png',
    });

    return NextResponse.json({
      success: true,
      certificate: {
        ...newCert,
        template: matchedTemplate,
      },
    });
  } catch (err: unknown) {
    console.error('Error in auto-issue route:', err);
    const message = err instanceof Error ? err.message : 'تعذر إصدار الشهادة';
    return NextResponse.json(
      { success: false, error: message },
      { status: err instanceof CertificatePersistenceError ? 503 : 500 },
    );
  }
}
