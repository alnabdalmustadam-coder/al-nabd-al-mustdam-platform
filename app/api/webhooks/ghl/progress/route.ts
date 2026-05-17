import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stmtProgressed, stmtCompleted, storeStatement } from "@/lib/xapi";

/**
 * GHL Webhook — Course Progress / Completion + xAPI Tracking
 * يستقبل webhook من GHL Workflow عند إكمال كورس أو تحديث تقدم
 * ويسجل الحدث في xAPI للاعتماد NELC
 *
 * Webhook URL: https://nabdtraining.com/api/webhooks/ghl/progress
 *
 * Expected payload from GHL Workflow:
 * {
 *   "email": "{{contact.email}}",
 *   "courseId": "course-xxx",
 *   "courseName": "اسم الكورس",       // اسم الكورس (مطلوب لـ xAPI)
 *   "progress": 100,              // نسبة التقدم (0-100)
 *   "completed": true             // هل أكمل الكورس
 * }
 */

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
    const payload = await req.json();

    console.log("📊 GHL Progress Webhook received:", JSON.stringify(payload).slice(0, 500));

    const email = (
      payload.email ||
      payload.contact?.email ||
      payload.contact_email ||
      ""
    ).toLowerCase().trim();

    if (!email) {
      console.warn("⚠️ Progress webhook: No email found in payload");
      return NextResponse.json(
        { success: false, message: "No email in payload" },
        { status: 200, headers: CORS }
      );
    }

    const courseId = payload.courseId || payload.course_id || null;
    const progress = typeof payload.progress === "number" ? Math.min(100, Math.max(0, payload.progress)) : null;
    const completed = payload.completed === true || payload.completed === "true" || progress === 100;

    if (!courseId) {
      console.warn("⚠️ Progress webhook: No courseId in payload");
      return NextResponse.json(
        { success: false, message: "No courseId in payload" },
        { status: 200, headers: CORS }
      );
    }

    // Build update object
    const updateData: Record<string, any> = {};
    if (progress !== null) updateData.progress = progress;
    if (completed) {
      updateData.status = "completed";
      updateData.completed_at = new Date().toISOString();
      updateData.progress = 100;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: true, message: "No updates needed" },
        { headers: CORS }
      );
    }

    // Update enrollment record
    const { error } = await supabase
      .from("enrollments")
      .update(updateData)
      .eq("email", email)
      .eq("course_id", courseId);

    if (error) {
      console.error("❌ Progress update error:", error);
      return NextResponse.json(
        { success: false, message: "Database error", error: error.message },
        { status: 200, headers: CORS }
      );
    }

    console.log(`✅ Progress updated: ${email} → ${courseId} = ${progress}% ${completed ? "(COMPLETED)" : ""}`);

    // ── Generate xAPI statement for NELC compliance ──────────────────
    try {
      // Fetch learner profile for national ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, national_id")
        .eq("email", email)
        .maybeSingle();

      // Fetch course name from enrollment if not in payload
      const courseName = payload.courseName || payload.course_name || null;
      let courseTitle = courseName;
      if (!courseTitle) {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("course_title")
          .eq("email", email)
          .eq("course_id", courseId)
          .maybeSingle();
        courseTitle = enrollment?.course_title || "دورة تدريبية";
      }

      const learnerName = profile?.full_name || email.split("@")[0];
      const nationalId = profile?.national_id || "";

      const xapiParams = {
        email,
        name: learnerName,
        nationalId,
        courseId,
        courseName: courseTitle,
        courseNameAr: courseTitle,
      };

      // Generate the appropriate xAPI statement
      const xapiStatement = completed
        ? stmtCompleted(xapiParams)
        : stmtProgressed({ ...xapiParams, progress: progress || 0 });

      const xapiResult = await storeStatement(xapiStatement);
      if (xapiResult.success) {
        console.log(`📋 xAPI ${completed ? "completed" : "progressed"} statement stored for ${email} → ${courseId}`);
      } else {
        console.error("⚠️ xAPI store failed (non-fatal):", xapiResult.error);
      }
    } catch (xapiErr) {
      console.error("⚠️ xAPI generation failed (non-fatal):", xapiErr);
    }

    return NextResponse.json(
      { success: true, message: "Progress updated + xAPI tracked" },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("❌ Progress Webhook Error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 200, headers: CORS }
    );
  }
}
