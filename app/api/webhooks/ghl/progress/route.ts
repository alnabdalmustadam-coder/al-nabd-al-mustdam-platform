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

    const courseTitle = payload.courseTitle || payload.courseName || payload.course_name || "دورة جديدة";
    let courseId = payload.courseId || payload.course_id || null;
    
    if (!courseId) {
      // Deterministic ID fallback to match enrollment
      courseId = `course-${courseTitle.replace(/\s+/g, '-').toLowerCase()}`;
    }

    // Parse progress safely handling both numbers and strings (e.g., "100" or "100%")
    let parsedProgress = null;
    if (payload.progress !== undefined && payload.progress !== null) {
      const p = parseInt(String(payload.progress).replace(/\D/g, ''), 10);
      if (!isNaN(p)) parsedProgress = Math.min(100, Math.max(0, p));
    }
    const progress = parsedProgress;
    
    const completed = payload.completed === true || payload.completed === "true" || progress === 100;

    // Build upsert object
    const upsertData: Record<string, any> = {
      email,
      course_id: courseId,
      course_title: courseTitle
    };
    if (progress !== null) upsertData.progress = progress;
    if (completed) {
      upsertData.status = "completed";
      upsertData.completed_at = new Date().toISOString();
      upsertData.progress = 100;
    } else {
      upsertData.status = "active";
    }

    // Upsert enrollment record (create if not exists, update if exists)
    // Smart Fallback: If GHL didn't send a specific progress percentage, auto-increment by 10%
    // When progress reaches 90%+, the next event means the course is completed (100%)
    if (progress === null && !completed) {
      const { data: existing } = await supabase
        .from("enrollments")
        .select("progress")
        .eq("email", email)
        .eq("course_id", courseId)
        .maybeSingle();
      
      const currentProg = existing?.progress || 0;
      const newProgress = currentProg + 10;
      
      if (newProgress >= 100) {
        // Student reached 100% — mark as completed
        upsertData.progress = 100;
        upsertData.status = "completed";
        upsertData.completed_at = new Date().toISOString();
      } else {
        upsertData.progress = newProgress;
      }
    }

    if (Object.keys(upsertData).length <= 4 && upsertData.progress === undefined) {
      return NextResponse.json(
        { success: true, message: "No progress updates needed" },
        { headers: CORS }
      );
    }

    const { error } = await supabase
      .from("enrollments")
      .upsert(upsertData, { onConflict: "email,course_id" });

    if (error) {
      console.error("❌ Progress upsert error:", error);
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

      // courseTitle is already extracted above
      if (!courseTitle || courseTitle === "دورة جديدة") {
        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("course_title")
          .eq("email", email)
          .eq("course_id", courseId)
          .maybeSingle();
        if (enrollment?.course_title) {
          // keep it
        }
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
      // Use upsertData.progress (the actual calculated value) instead of raw payload
      const actualProgress = upsertData.progress || progress || 0;
      const isCompleted = completed || upsertData.status === "completed";
      const xapiStatement = isCompleted
        ? stmtCompleted(xapiParams)
        : stmtProgressed({ ...xapiParams, progress: actualProgress });

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
