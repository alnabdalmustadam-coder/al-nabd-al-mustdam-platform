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
      score,
      grade,
      hours,
      isFinalExam,
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

    const cleanCourseId = courseSlug ? courseSlug.replace(/^course-/, '') : '';
    const enrollmentIds = [
      courseSlug,
      cleanCourseId,
      courseSlug ? `course-${cleanCourseId}` : null,
    ].filter(Boolean) as string[];

    let enrollmentQuery = supabase
      .from('enrollments')
      .select('*')
      .eq('email', email);

    if (enrollmentIds.length > 0) {
      enrollmentQuery = enrollmentQuery.in('course_id', enrollmentIds);
    } else {
      enrollmentQuery = enrollmentQuery.eq('course_title', courseTitle);
    }
    const { data: enrollment } = await enrollmentQuery.maybeSingle();

    const isCompleted = enrollment && (Number(enrollment.progress) >= 100 || enrollment.status === 'completed');
    const passedFinalAssessment = Boolean(isFinalExam && typeof score === 'number' && score >= 70);

    if (!enrollment || (!isCompleted && !passedFinalAssessment)) {
      return NextResponse.json(
        { success: false, error: 'لا يمكن إصدار الشهادة قبل إكمال متطلبات الدورة واجتياز التقييم' },
        { status: 403 }
      );
    }

    // Mark enrollment completed if passed final exam
    if (passedFinalAssessment && (!isCompleted || Number(enrollment.progress) < 100)) {
      await supabase
        .from('enrollments')
        .update({
          progress: 100,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id);
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', auth.user.id)
      .maybeSingle();
    const name = profile?.full_name || auth.user.user_metadata?.full_name || 'المتدرب المتميز';

    // Fetch live courses to accurately resolve duration & canonical title
    const allCourses = await getAllCoursesAsync();
    const matchedCourse =
      (courseSlug ? findCourseByIdentifier(allCourses, courseSlug) : null) ||
      allCourses.find((c) => c.title === courseTitle || (cleanCourseId && c.slug === cleanCourseId)) ||
      (courseSlug ? getCourseBySlug(courseSlug) : null) ||
      null;

    const title = enrollment.course_title || matchedCourse?.title || courseTitle || 'الدورة التدريبية المعتمدة';
    const finalGrade = formatCertificateGrade(score, grade);
    const finalHours = formatCertificateHours(matchedCourse?.duration, hours);

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
      grade: finalGrade,
      hours: finalHours,
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
