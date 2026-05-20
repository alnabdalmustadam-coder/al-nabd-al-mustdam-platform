import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stmtEvaluated, storeStatement } from "@/lib/xapi";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { email, courseId, courseTitle, rating, feedback } = payload;

    if (!email || !courseId || !rating) {
      return NextResponse.json({ message: "البيانات غير مكتملة" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user profile for National ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const learnerName = profile?.full_name || email.split("@")[0];
    const nationalId = profile?.national_id || "";

    // Generate and store xAPI Evaluation statement
    const xapiStatement = stmtEvaluated({
      email: normalizedEmail,
      name: learnerName,
      nationalId,
      courseId,
      courseName: courseTitle || "دورة بدون اسم",
      courseNameAr: courseTitle || "دورة بدون اسم",
      rating: parseInt(rating, 10),
      feedback: feedback || "",
    });

    const xapiResult = await storeStatement(xapiStatement);

    if (!xapiResult.success) {
      console.error("xAPI evaluation store error:", xapiResult.error);
      return NextResponse.json({ message: "حدث خطأ أثناء حفظ التقييم في السجل" }, { status: 500 });
    }

    // Update enrollment locally
    const { error: updateError } = await supabase
      .from("enrollments")
      .update({ is_evaluated: true })
      .eq("email", normalizedEmail)
      .eq("course_id", courseId);

    if (updateError) {
      console.error("Failed to update enrollment is_evaluated status:", updateError);
    }

    return NextResponse.json({ success: true, message: "تم حفظ التقييم بنجاح" });
  } catch (error: any) {
    console.error("Submit evaluation error:", error);
    return NextResponse.json({ message: "حدث خطأ داخلي" }, { status: 500 });
  }
}
