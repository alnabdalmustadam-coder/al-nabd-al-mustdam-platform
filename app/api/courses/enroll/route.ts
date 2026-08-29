import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stmtRegistered, storeStatement } from "@/lib/xapi";
import { requireUser } from "@/lib/security/auth";
import { getCourseBySlugAsync } from "@/lib/courses-store";

const CORS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Temporary launch policy: all published catalog courses can be self-enrolled
// without payment. Set this explicitly to "false" when a verified payment
// webhook becomes the sole source of paid-course entitlements.
const TEMPORARY_FREE_ENROLLMENT = process.env.TEMPORARY_FREE_ENROLLMENT !== "false";

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;

    const { courseId } = await req.json();
    const email = auth.user.email;

    if (!email || typeof courseId !== 'string' || !/^[a-zA-Z0-9_-]{1,120}$/.test(courseId)) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني ومعرف الدورة وعنوان الدورة مطلوبة" },
        { status: 400, headers: CORS }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanSlug = courseId.replace(/^course-/, "").trim();
    const course = await getCourseBySlugAsync(cleanSlug);
    if (!course) {
      return NextResponse.json({ success: false, message: 'الدورة غير موجودة' }, { status: 404 });
    }
    const courseTitle = course.title;
    const courseUrl = `/courses/${course.slug}`;

    if (Number(course.price || 0) > 0 && !TEMPORARY_FREE_ENROLLMENT) {
      return NextResponse.json(
        {
          success: false,
          message: 'التسجيل الذاتي للدورات المدفوعة متوقف حتى تفعيل بوابة الدفع',
        },
        { status: 403, headers: CORS },
      );
    }

    // 1. Check if user is already enrolled in this course to prevent duplicates & protect progress
    const { data: existingEnroll } = await supabase
      .from("enrollments")
      .select("id, progress, status")
      .eq("email", normalizedEmail)
      .in('course_id', [
        courseId,
        `course-${cleanSlug}`,
        cleanSlug,
        course.slug,
        String(course.id),
        ...(course.ghlCourseId ? [course.ghlCourseId, course.ghlCourseId.replace(/^course-/, '')] : []),
      ])
      .limit(1)
      .maybeSingle();

    if (existingEnroll) {
      return NextResponse.json(
        { 
          success: true, 
          alreadyEnrolled: true, 
          message: "أنت مسجل بالفعل في هذه الدورة مسبقاً",
          progress: existingEnroll.progress,
        },
        { headers: CORS }
      );
    }

    // 2. Fetch profile to get name and national ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const name = profile?.full_name || normalizedEmail.split("@")[0];
    const nationalId = profile?.national_id || "";

    // 3. Insert new enrollment in Supabase
    const { error: enrollError } = await supabase
      .from("enrollments")
      .insert({
        user_id: auth.user.id,
        email: normalizedEmail,
        course_id: course.slug,
        course_title: courseTitle,
        course_url: courseUrl || `/courses/${courseId}`,
        progress: 0,
        status: "active",
        enrolled_at: new Date().toISOString(),
      });

    if (enrollError?.code === "23505") {
      return NextResponse.json(
        {
          success: true,
          alreadyEnrolled: true,
          message: "أنت مسجل بالفعل في هذه الدورة مسبقاً",
        },
        { headers: CORS },
      );
    }

    if (enrollError) {
      console.error("Enrollment insert error:", enrollError);
      return NextResponse.json(
        { success: false, message: "فشل حفظ التسجيل في قاعدة البيانات", error: enrollError.message },
        { status: 500, headers: CORS }
      );
    }

    // 3. Write xAPI registered statement
    try {
      const registrationId = crypto.randomUUID();
      const statement = stmtRegistered({
        email: normalizedEmail,
        name,
        nationalId,
        courseId,
        courseName: courseTitle,
        courseNameAr: courseTitle,
        registrationId,
      });

      await storeStatement(statement);
    } catch (xapiErr) {
      console.error("Non-fatal: failed to store xAPI statement:", xapiErr);
    }

    return NextResponse.json(
      {
        success: true,
        temporaryFreeAccess: TEMPORARY_FREE_ENROLLMENT,
        message: TEMPORARY_FREE_ENROLLMENT
          ? "تم تفعيل الدورة مجاناً خلال فترة الإتاحة المؤقتة"
          : "تم تسجيلك في الدورة بنجاح",
      },
      { headers: CORS }
    );
  } catch (err: unknown) {
    console.error("Local enrollment route error:", err);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}
