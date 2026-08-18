import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stmtRegistered, storeStatement } from "@/lib/xapi";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { email, courseId, courseTitle, courseUrl } = await req.json();

    if (!email || !courseId || !courseTitle) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني ومعرف الدورة وعنوان الدورة مطلوبة" },
        { status: 400, headers: CORS }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanSlug = courseId.replace(/^course-/, "").trim();

    // 1. Check if user is already enrolled in this course to prevent duplicates & protect progress
    const { data: existingEnroll } = await supabase
      .from("enrollments")
      .select("id, progress, status")
      .eq("email", normalizedEmail)
      .or(`course_id.eq.${courseId},course_id.eq.course-${cleanSlug},course_id.eq.${cleanSlug},course_title.eq.${courseTitle}`)
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
        email: normalizedEmail,
        course_id: courseId,
        course_title: courseTitle,
        course_url: courseUrl || `/courses/${courseId}`,
        progress: 0,
        status: "active",
        enrolled_at: new Date().toISOString(),
      });

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
      { success: true, message: "تم تسجيلك في الدورة بنجاح محلياً" },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("Local enrollment route error:", err);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}
