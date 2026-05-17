import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  storeStatement,
  buildStatement,
  buildActor,
  buildActivity,
  XAPI_VERBS,
} from "@/lib/xapi";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    console.log("⭐ GHL Evaluation Webhook received:", JSON.stringify(payload).slice(0, 500));

    const email = (payload.email || payload.contact?.email || payload.contact_email || "").toLowerCase().trim();
    if (!email) {
      return NextResponse.json({ success: false, message: "No email in payload" }, { status: 200, headers: CORS });
    }

    const courseId = payload.courseId || payload.course_id || null;
    if (!courseId) {
      return NextResponse.json({ success: false, message: "No courseId in payload" }, { status: 200, headers: CORS });
    }

    const courseTitle = payload.courseTitle || payload.courseName || payload.course_name || "دورة تدريبية";
    
    // Parse rating/score
    let rating = 5; // Default rating if not provided or unparsable
    if (payload.rating !== undefined) {
      const parsed = parseFloat(payload.rating);
      if (!isNaN(parsed)) {
        rating = parsed;
      }
    } else if (payload.score !== undefined) {
      const parsed = parseFloat(payload.score);
      if (!isNaN(parsed)) {
        rating = parsed;
      }
    }

    // Get Learner info from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("email", email)
      .maybeSingle();

    const learnerName = profile?.full_name || payload.firstName ? `${payload.firstName} ${payload.lastName || ""}`.trim() : email.split("@")[0];
    const learnerNationalId = profile?.national_id || undefined;

    // Build xAPI Statement
    const actor = buildActor({
      email,
      name: learnerName,
      nationalId: learnerNationalId,
    });

    const activity = buildActivity({
      courseId,
      courseName: courseTitle,
    });

    // Rating is usually out of 5 stars. Let's send raw as 5, max as 5, scaled as rating/5.
    const maxRating = 5;
    const scaledScore = Math.min(1, Math.max(0, rating / maxRating));

    const statement = buildStatement({
      actor,
      verb: XAPI_VERBS.evaluated,
      object: activity,
      result: {
        score: {
          raw: rating,
          min: 0,
          max: maxRating,
          scaled: scaledScore,
        },
        extensions: {
          "https://nabdtraining.com/extensions/feedback": payload.feedback || "",
          "https://nabdtraining.com/extensions/rating": rating
        }
      }
    });

    const xapiResult = await storeStatement(statement);

    if (!xapiResult.success) {
      console.error("❌ Failed to store xAPI evaluated statement:", xapiResult.error);
      return NextResponse.json({ success: false, message: "Failed to store xAPI statement" }, { status: 500, headers: CORS });
    }

    console.log(`📋 xAPI evaluated statement stored for ${email} -> ${courseId} with rating ${rating}`);

    return NextResponse.json({
      success: true,
      message: "Evaluation recorded + xAPI tracked",
      statementId: statement.id
    }, { status: 200, headers: CORS });

  } catch (error: any) {
    console.error("Evaluation Webhook Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error", detail: error.message },
      { status: 500, headers: CORS }
    );
  }
}
