import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { stmtRegistered, storeStatement } from "@/lib/xapi";

/**
 * GHL Webhook — Enrollment + xAPI Tracking
 * يستقبل webhook من GHL Workflow عند "Offer Access Granted" أو شراء كورس
 * ويسجل الحدث في xAPI للاعتماد NELC
 *
 * Webhook URL: https://nabdtraining.com/api/webhooks/ghl/enrollment
 *
 * Expected payload from GHL Workflow (Send Webhook action):
 * {
 *   "email": "{{contact.email}}",
 *   "firstName": "{{contact.first_name}}",
 *   "lastName": "{{contact.last_name}}",
 *   "courseId": "course-xxx",          // يدوي أو من custom field
 *   "courseTitle": "اسم الكورس",       // يدوي أو من custom field
 *   "courseUrl": "https://...",         // رابط الكورس في GHL
 *   "offerId": "offer_xxx"             // GHL Offer ID (اختياري)
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

    console.log("📩 GHL Enrollment Webhook received:", JSON.stringify(payload).slice(0, 500));

    // Extract email — support multiple GHL payload formats
    const email = (
      payload.email ||
      payload.contact?.email ||
      payload.contact_email ||
      ""
    ).toLowerCase().trim();

    if (!email) {
      console.warn("⚠️ Enrollment webhook: No email found in payload");
      return NextResponse.json(
        { success: false, message: "No email in payload" },
        { status: 200, headers: CORS }
      );
    }

    // Extract course info
    const courseTitle = payload.courseTitle || payload.course_title || payload.offerName || payload.offer_name || "دورة جديدة";
    let courseId = payload.courseId || payload.course_id || payload.offerId || payload.offer_id;
    if (!courseId) {
      // Use deterministic ID based on title instead of Date.now() to prevent duplicates
      courseId = `course-${courseTitle.replace(/\s+/g, '-').toLowerCase()}`;
    }
    const courseUrl = payload.courseUrl || payload.course_url || "https://members.nabdtraining.com";
    const ghlOfferId = payload.offerId || payload.offer_id || null;

    // Extract full name if available
    const fullName = payload.firstName || payload.contact?.firstName
      ? `${payload.firstName || payload.contact?.firstName || ""} ${payload.lastName || payload.contact?.lastName || ""}`.trim()
      : null;

    // 1. Upsert enrollment in Supabase
    const { error: enrollError } = await supabase.from("enrollments").upsert(
      {
        email,
        course_id: courseId,
        course_title: courseTitle,
        course_url: courseUrl,
        ghl_offer_id: ghlOfferId,
        enrolled_at: new Date().toISOString(),
        status: "active",
        progress: 0,
      },
      { onConflict: "email,course_id" }
    );

    if (enrollError) {
      console.error("❌ Enrollment upsert error:", enrollError);
      return NextResponse.json(
        { success: false, message: "Database error", error: enrollError.message },
        { status: 200, headers: CORS }
      );
    }

    // 2. Also ensure profile exists (upsert if needed)
    if (fullName) {
      await supabase.from("profiles").upsert(
        {
          email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );
    }

    console.log(`✅ Enrollment saved: ${email} → ${courseTitle} (${courseId})`);

    // 3. Generate xAPI "registered" statement for NELC compliance
    try {
      // Fetch learner profile for national ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, national_id")
        .eq("email", email)
        .maybeSingle();

      const learnerName = profile?.full_name || fullName || email.split("@")[0];
      const nationalId = profile?.national_id || "";

      const xapiStatement = stmtRegistered({
        email,
        name: learnerName,
        nationalId,
        courseId,
        courseName: courseTitle,
        courseNameAr: courseTitle,
      });

      const xapiResult = await storeStatement(xapiStatement);
      if (xapiResult.success) {
        console.log(`📋 xAPI registered statement stored for ${email} → ${courseId}`);
      } else {
        console.error("⚠️ xAPI store failed (non-fatal):", xapiResult.error);
      }
    } catch (xapiErr) {
      console.error("⚠️ xAPI generation failed (non-fatal):", xapiErr);
    }

    return NextResponse.json(
      { success: true, message: "Enrollment recorded + xAPI tracked" },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("❌ Enrollment Webhook Error:", err);
    // Always return 200 to GHL so it doesn't retry
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 200, headers: CORS }
    );
  }
}
