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

    // 1. Fetch profile to get name and national ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const name = profile?.full_name || normalizedEmail.split("@")[0];
    const nationalId = profile?.national_id || "";

    // 2. Upsert enrollment in Supabase
    const { error: enrollError } = await supabase
      .from("enrollments")
      .upsert(
        {
          email: normalizedEmail,
          course_id: courseId,
          course_title: courseTitle,
          course_url: courseUrl || "https://members.nabdtraining.com",
          progress: 0,
          status: "active",
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "email,course_id" }
      );

    if (enrollError) {
      console.error("Enrollment upsert error:", enrollError);
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
