import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stmtProgressed, stmtCompleted, storeStatement } from "@/lib/xapi";
import { courses } from "@/data/courses";
import { readVerifiedGhlWebhook } from "@/lib/security/integrations";

/**
 * Build a lookup map: courseId/ghlCourseId/slug → lessonsCount
 * This ensures we use the REAL lesson count for each course
 * instead of a hardcoded default.
 */
const COURSE_LESSONS_MAP: Record<string, number> = {};
for (const c of courses) {
  if (c.ghlCourseId) {
    COURSE_LESSONS_MAP[c.ghlCourseId] = c.lessonsCount;
  }
  // Also map by slug and generated ID for flexibility
  COURSE_LESSONS_MAP[c.slug] = c.lessonsCount;
  COURSE_LESSONS_MAP[`course-${c.slug}`] = c.lessonsCount;
}

/**
 * GHL Webhook — Course Progress / Completion + xAPI Tracking
 * يستقبل webhook من GHL Workflow عند إكمال درس
 * ويسجل الحدث في xAPI للاعتماد NELC
 *
 * Webhook URL: https://nabdtraining.com/api/webhooks/ghl/progress
 *
 * Expected payload from GHL Workflow (as configured):
 * {
 *   "email": "{{contact.email}}",
 *   "progress": "{{membership.percent_completed}}",
 *   "courseTitle": "{{membership.product_title}}",
 *   "courseId": "{{membership.offer_id}}",
 *   "courseUrl": "https://members.nabdtraining.com/library/...",
 *   "NationalID": "{{contact.national_id}}"
 * }
 */

const CORS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const webhook = await readVerifiedGhlWebhook(req);
    if (!webhook.ok) return webhook.response;
    const payload: any = webhook.payload;

    // ── Safe summary logging (no PII) ──────────────────────────────
    console.log("📊 GHL Progress Webhook received:", {
      hasCourseId: !!payload.courseId,
      hasProgress: payload.progress !== undefined,
      hasEmail: !!payload.email,
      timestamp: new Date().toISOString(),
    });

    // ── Extract email ──────────────────────────────────────────────
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

    // ── Extract course info ────────────────────────────────────────
    const courseTitle = payload.courseTitle || payload.courseName || payload.course_name || payload.product_title || "دورة جديدة";
    let courseId = payload.courseId || payload.course_id || payload.offer_id || null;
    const courseUrl = payload.courseUrl || payload.course_url || null;
    const nationalIdFromPayload = payload.NationalID || payload.nationalID || payload.national_id || null;

    if (!courseId) {
      courseId = `course-${courseTitle.replace(/\s+/g, '-').toLowerCase()}`;
    }

    // ── Parse progress (handles numbers, strings, "80%", empty strings) ──
    let parsedProgress: number | null = null;
    const rawProgress = payload.progress;
    console.log(`📊 Raw progress value: "${rawProgress}" (type: ${typeof rawProgress})`);

    if (rawProgress !== undefined && rawProgress !== null && rawProgress !== "") {
      const cleaned = String(rawProgress).replace(/[^0-9.]/g, '');
      if (cleaned !== "") {
        const p = parseFloat(cleaned);
        if (!isNaN(p)) {
          // Handle both 0-1 scale (0.8) and 0-100 scale (80)
          parsedProgress = p <= 1 && p > 0 ? Math.round(p * 100) : Math.round(Math.min(100, Math.max(0, p)));
        }
      }
    }

    console.log(`📊 Parsed progress: ${parsedProgress}% for ${email} → ${courseId}`);

    const completed = payload.completed === true || payload.completed === "true" || parsedProgress === 100;

    // ── Build upsert data ──────────────────────────────────────────
    const upsertData: Record<string, any> = {
      email,
      course_id: courseId,
      course_title: courseTitle,
    };

    if (courseUrl) upsertData.course_url = courseUrl;

    if (parsedProgress !== null) {
      // GHL sent real progress — use it directly
      upsertData.progress = parsedProgress;
      console.log(`✅ Using REAL progress from GHL: ${parsedProgress}%`);
    }

    if (completed || parsedProgress === 100) {
      upsertData.status = "completed";
      upsertData.completed_at = new Date().toISOString();
      upsertData.progress = 100;
    } else if (parsedProgress !== null) {
      upsertData.status = "active";
    }

    // ── Fallback: GHL didn't send progress — count lesson events ──
    if (parsedProgress === null && !completed) {
      console.log("⚠️ No progress from GHL — using lesson-count fallback");

      // Count how many progress webhook calls we've received for this student+course
      const { count: lessonCount } = await supabase
        .from("xapi_statements")
        .select("*", { count: "exact", head: true })
        .eq("actor_email", email)
        .ilike("object_id", `%${courseId}%`)
        .eq("verb_display", "progressed");

      const completedLessons = (lessonCount || 0) + 1; // +1 for current event

      // Try to get existing progress from enrollments
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("progress")
        .eq("email", email)
        .eq("course_id", courseId)
        .maybeSingle();

      // Use REAL lesson count from course config, NOT hardcoded 5
      const totalLessons = COURSE_LESSONS_MAP[courseId] || 10;
      const calculatedProgress = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

      // Never go backwards — keep the higher value
      const existingProgress = enrollment?.progress || 0;
      upsertData.progress = Math.max(existingProgress, calculatedProgress);
      console.log(`📊 Fallback progress: ${completedLessons}/${totalLessons} lessons = ${calculatedProgress}% (existing: ${existingProgress}%, using: ${upsertData.progress}%) [source: ${COURSE_LESSONS_MAP[courseId] ? 'course-config' : 'default-10'}]`);

      if (calculatedProgress >= 100) {
        upsertData.status = "completed";
        upsertData.completed_at = new Date().toISOString();
      } else {
        upsertData.status = "active";
      }
    }

    // ── Upsert enrollment ──────────────────────────────────────────
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

    const finalProgress = upsertData.progress;
    const isCompleted = upsertData.status === "completed";
    console.log(`✅ Progress updated: ${email} → ${courseId} = ${finalProgress}% ${isCompleted ? "(COMPLETED)" : ""}`);

    // ── Generate xAPI statement ────────────────────────────────────
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, national_id")
        .eq("email", email)
        .maybeSingle();

      const learnerName = profile?.full_name || email.split("@")[0];
      const nationalId = nationalIdFromPayload || profile?.national_id || "";

      const xapiParams = {
        email,
        name: learnerName,
        nationalId,
        courseId,
        courseName: courseTitle,
        courseNameAr: courseTitle,
      };

      const xapiStatement = isCompleted
        ? stmtCompleted(xapiParams)
        : stmtProgressed({ ...xapiParams, progress: finalProgress || 0 });

      const xapiResult = await storeStatement(xapiStatement);
      if (xapiResult.success) {
        console.log(`📋 xAPI ${isCompleted ? "completed" : "progressed"} statement stored: ${finalProgress}%`);
      } else {
        console.error("⚠️ xAPI store failed (non-fatal):", xapiResult.error);
      }
    } catch (xapiErr) {
      console.error("⚠️ xAPI generation failed (non-fatal):", xapiErr);
    }

    return NextResponse.json(
      { success: true, message: `Progress updated: ${finalProgress}%`, progress: finalProgress },
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
