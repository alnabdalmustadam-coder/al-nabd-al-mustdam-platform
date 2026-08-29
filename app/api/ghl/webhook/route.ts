import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  stmtRegistered,
  stmtLaunched,
  stmtProgressed,
  stmtCompleted,
  storeStatement,
} from "@/lib/xapi";
import { readVerifiedGhlWebhook } from "@/lib/security/integrations";

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

    console.log("GHL Webhook received:", JSON.stringify(payload).slice(0, 500));

    // Extract common fields from various GHL payload formats
    const email =
      payload.email ||
      payload.contact_email ||
      (payload.contact && payload.contact.email);
    const contactId =
      payload.contact_id ||
      payload.id ||
      (payload.contact && payload.contact.id);
    const contactName =
      payload.full_name ||
      payload.name ||
      payload.contact_name ||
      (payload.contact &&
        `${payload.contact.firstName || ""} ${payload.contact.lastName || ""}`.trim());
    const eventType =
      payload.event ||
      payload.type ||
      payload.action ||
      "contact_update";

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Missing email in webhook payload" },
        { status: 400, headers: CORS }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // ── 1. Update GHL Contact ID in profile ──────────────────────────
    if (contactId) {
      const { error } = await supabase
        .from("profiles")
        .update({ ghl_contact_id: contactId })
        .eq("email", cleanEmail);

      if (error) {
        console.error("Profile update error:", error);
      }
    }

    // ── 2. Fetch profile for xAPI actor data ─────────────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("email", cleanEmail)
      .maybeSingle();

    const learnerName = profile?.full_name || contactName || cleanEmail.split("@")[0];
    const nationalId = profile?.national_id || "";

    // ── 3. Detect course info from payload ───────────────────────────
    const courseId =
      payload.course_id ||
      payload.courseId ||
      payload.offer_id ||
      payload.product_id ||
      "general";
    const courseName =
      payload.course_name ||
      payload.courseName ||
      payload.offer_name ||
      payload.product_name ||
      "دورة تدريبية";
    const progress = payload.progress || payload.percentage || 0;

    // ── 4. Generate xAPI statement based on event ────────────────────
    const xapiParams = {
      email: cleanEmail,
      name: learnerName,
      nationalId,
      courseId,
      courseName,
      courseNameAr: courseName,
    };

    let xapiStatement = null;

    switch (eventType) {
      case "contact_create":
      case "contact_created":
      case "registration":
      case "order_created":
      case "payment_received":
        xapiStatement = stmtRegistered(xapiParams);
        break;

      case "course_started":
      case "course_launched":
      case "course_enrolled":
      case "enrollment":
        xapiStatement = stmtLaunched(xapiParams);
        break;

      case "course_progress":
      case "progress_update":
      case "lesson_completed":
        xapiStatement = stmtProgressed({ ...xapiParams, progress });
        break;

      case "course_completed":
      case "course_finished":
      case "completion":
        xapiStatement = stmtCompleted(xapiParams);
        break;

      case "contact_update":
      case "contact_updated":
      default:
        // For general updates, check if there are tags indicating course enrollment
        const tags: string[] = payload.tags || (payload.contact && payload.contact.tags) || [];
        if (tags.some((t: string) => t.startsWith("course-"))) {
          xapiStatement = stmtRegistered(xapiParams);
        }
        break;
    }

    // ── 5. Store xAPI statement ──────────────────────────────────────
    let xapiResult = null;
    if (xapiStatement) {
      xapiResult = await storeStatement(xapiStatement);
      if (xapiResult.success) {
        console.log(
          `xAPI Statement stored: ${xapiStatement.verb.display["en-US"]} for ${cleanEmail}`
        );
      } else {
        console.error("xAPI store failed:", xapiResult.error);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Webhook processed successfully",
        xapi: xapiResult
          ? { stored: xapiResult.success, statementId: xapiStatement?.id }
          : { stored: false, reason: "No matching xAPI event" },
      },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500, headers: CORS }
    );
  }
}
