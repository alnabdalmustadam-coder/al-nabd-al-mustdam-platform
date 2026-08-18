import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCourseBySlug, courses } from "@/data/courses";

export async function POST(req: NextRequest) {
  try {
    const { email, courseSlug, progress, courseTitle } = await req.json();

    if (!email || (!courseSlug && !courseTitle)) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني ومعرف الدورة مطلوبان" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanSlug = (courseSlug || "").replace(/^course-/, "").trim();
    const matchedCourse = getCourseBySlug(cleanSlug) || getCourseBySlug(courseSlug) || (courseTitle ? courses.find(c => c.title === courseTitle) : undefined);
    
    const progressVal = Math.min(100, Math.max(0, Number(progress) || 0));
    const isCompleted = progressVal >= 100;

    // Collect all possible course identifier variants
    const matchIds = new Set<string>();
    if (courseSlug) {
      matchIds.add(courseSlug);
      matchIds.add(`course-${cleanSlug}`);
      matchIds.add(cleanSlug);
    }
    if (matchedCourse) {
      matchIds.add(matchedCourse.slug);
      matchIds.add(`course-${matchedCourse.slug}`);
      if (matchedCourse.ghlCourseId) {
        matchIds.add(matchedCourse.ghlCourseId);
        matchIds.add(matchedCourse.ghlCourseId.replace(/^course-/, ""));
      }
    }

    const orClauses = Array.from(matchIds).filter(Boolean).map(id => `course_id.eq.${id}`);
    if (matchedCourse?.title) {
      orClauses.push(`course_title.eq.${matchedCourse.title}`);
    }
    if (courseTitle) {
      orClauses.push(`course_title.eq.${courseTitle}`);
    }

    const orString = orClauses.join(",");

    // Update any enrollment matching the email and courseSlug/title variants
    const { data, error } = await supabase
      .from("enrollments")
      .update({
        progress: progressVal,
        status: isCompleted ? "completed" : "active",
        completed_at: isCompleted ? new Date().toISOString() : null,
      })
      .eq("email", normalizedEmail)
      .or(orString)
      .select();

    if (error) {
      console.error("Supabase enrollment update error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Auto-issue certificate if course is completed
    let issuedCert = null;
    if (isCompleted) {
      try {
        const { getAllIssuedCertificates, getAllTemplates, issueCertificate } = await import('@/lib/certificates-store');
        const finalTitle = matchedCourse?.title || courseTitle || "دورة تدريبية معتمدة";
        const allIssued = getAllIssuedCertificates();
        const allTemplates = getAllTemplates();

        const alreadyIssued = allIssued.some(
          c =>
            c.studentEmail?.toLowerCase() === normalizedEmail &&
            (c.courseTitle.toLowerCase().trim() === finalTitle.toLowerCase().trim() ||
             c.courseTitle.includes(finalTitle) ||
             finalTitle.includes(c.courseTitle))
        );

        if (!alreadyIssued) {
          // Look up student name from profiles or user metadata
          let resolvedStudentName = 'المتدرب المتميز';
          try {
            const { data: prof } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('email', normalizedEmail)
              .maybeSingle();
            if (prof?.full_name) {
              resolvedStudentName = prof.full_name;
            }
          } catch (pErr) {
            console.warn('Profile fetch error during auto-issue:', pErr);
          }

          const matchedTpl =
            allTemplates.find(
              t =>
                t.courseTitle.toLowerCase().trim() === finalTitle.toLowerCase().trim() ||
                finalTitle.toLowerCase().includes(t.courseTitle.toLowerCase()) ||
                t.courseTitle.toLowerCase().includes(finalTitle.toLowerCase())
            ) ||
            allTemplates.find(t => t.autoIssue) ||
            allTemplates[0];

          issuedCert = issueCertificate({
            studentName: resolvedStudentName,
            studentEmail: normalizedEmail,
            courseTitle: finalTitle,
            templateId: matchedTpl ? matchedTpl.id : 'tpl-1',
            grade: 'ممتاز مرتفع (%98)',
            hours: '30 ساعة تدريبية معتمدة',
            imageUrl: matchedTpl?.imageUrl || '/1.png',
          });
        }
      } catch (certErr) {
        console.error('Error auto-issuing certificate on course completion:', certErr);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount: data?.length || 0,
      progress: progressVal,
      matchedCourses: data?.map(d => d.course_id) || [],
      issuedCertificate: issuedCert,
    });
  } catch (err: any) {
    console.error("Error in update-progress route:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
