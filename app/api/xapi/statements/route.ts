import { NextRequest, NextResponse } from "next/server";
import {
  storeStatement,
  queryStatements,
  buildStatement,
  buildActor,
  buildActivity,
  XAPI_VERBS,
  type XAPIStatement,
} from "@/lib/xapi";
import { supabase } from "@/lib/supabase";
import { verifyBasicAuth, xapiUnauthorizedResponse } from "@/lib/security/integrations";

/**
 * xAPI LRS Endpoint — /api/xapi/statements
 *
 * Implements the xAPI Statements Resource as per the xAPI 1.0.3 spec.
 * NELC compliance requires a functioning LRS endpoint that can:
 * - POST: Receive and store xAPI statements
 * - GET: Query stored xAPI statements
 *
 * Reference: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#stmtres
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Experience-API-Version",
  "X-Experience-API-Version": "1.0.3",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

/**
 * POST /api/xapi/statements
 *
 * Receives xAPI statements and stores them in the LRS (Supabase).
 * Supports single statement or array of statements.
 *
 * Body: XAPIStatement | XAPIStatement[]
 * Or simplified body: { email, name, nationalId, verb, courseId, courseName, progress?, score? }
 */
export async function POST(req: NextRequest) {
  try {
    if (!verifyBasicAuth(req)) return xapiUnauthorizedResponse();
    const body = await req.json();

    // ── Mode 1: Raw xAPI Statement(s) ──────────────────────────────────
    if (body.actor && body.verb && body.object) {
      // Single raw statement
      const statement: XAPIStatement = {
        ...body,
        id: body.id || crypto.randomUUID(),
        timestamp: body.timestamp || new Date().toISOString(),
        version: body.version || "1.0.3",
      };

      const result = await storeStatement(statement);
      if (!result.success) {
        return NextResponse.json(
          { success: false, message: result.error },
          { status: 500, headers: CORS }
        );
      }

      return NextResponse.json(
        { success: true, statementId: statement.id },
        { status: 200, headers: CORS }
      );
    }

    // ── Mode 2: Array of raw statements ────────────────────────────────
    if (Array.isArray(body)) {
      const ids: string[] = [];
      for (const stmt of body) {
        const statement: XAPIStatement = {
          ...stmt,
          id: stmt.id || crypto.randomUUID(),
          timestamp: stmt.timestamp || new Date().toISOString(),
          version: stmt.version || "1.0.3",
        };
        const result = await storeStatement(statement);
        if (result.success) ids.push(statement.id);
      }
      return NextResponse.json(
        { success: true, statementIds: ids, stored: ids.length },
        { status: 200, headers: CORS }
      );
    }

    // ── Mode 3: Simplified format (for internal use) ───────────────────
    const {
      email,
      name,
      nationalId,
      verb,
      courseId,
      courseName,
      courseNameAr,
      progress,
      score,
      duration,
      registrationId,
    } = body;

    if (!email || !verb || !courseId || !courseName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: email, verb, courseId, courseName",
        },
        { status: 400, headers: CORS }
      );
    }

    // Validate verb
    const verbKey = verb as keyof typeof XAPI_VERBS;
    const xapiVerb = XAPI_VERBS[verbKey];
    if (!xapiVerb) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid verb: ${verb}. Valid verbs: ${Object.keys(XAPI_VERBS).join(", ")}`,
        },
        { status: 400, headers: CORS }
      );
    }

    // Fetch learner name + nationalId from profile if not provided
    let learnerName = name || "";
    let learnerNationalId = nationalId || "";

    if (!learnerName || !learnerNationalId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, national_id")
        .eq("email", email.toLowerCase().trim())
        .maybeSingle();

      if (profile) {
        if (!learnerName && profile.full_name) learnerName = profile.full_name;
        if (!learnerNationalId && profile.national_id)
          learnerNationalId = profile.national_id;
      }
    }

    if (!learnerName) learnerName = email.split("@")[0];

    // Build and store the statement
    const actor = buildActor({
      email,
      name: learnerName,
      nationalId: learnerNationalId,
    });

    const activity = buildActivity({
      courseId,
      courseName,
      courseNameAr,
    });

    const statement = buildStatement({
      actor,
      verb: xapiVerb,
      object: activity,
      registrationId,
      result:
        progress !== undefined || score !== undefined || duration
          ? {
              ...(progress !== undefined
                ? {
                    extensions: {
                      "https://nabdtraining.com/extensions/progress": progress,
                    },
                  }
                : {}),
              ...(score !== undefined
                ? {
                    score: {
                      scaled: score / 100,
                      raw: score,
                      min: 0,
                      max: 100,
                    },
                    success: score >= 60,
                  }
                : {}),
              ...(duration ? { duration } : {}),
              ...(verb === "completed" ? { completion: true } : {}),
            }
          : undefined,
    });

    const storeResult = await storeStatement(statement);

    if (!storeResult.success) {
      return NextResponse.json(
        { success: false, message: storeResult.error },
        { status: 500, headers: CORS }
      );
    }

    // Also update enrollment progress if relevant
    if (
      verb === "progressed" &&
      progress !== undefined
    ) {
      await supabase
        .from("enrollments")
        .update({ progress })
        .eq("email", email.toLowerCase().trim())
        .eq("course_id", courseId);
    }

    if (verb === "completed") {
      await supabase
        .from("enrollments")
        .update({
          progress: 100,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("email", email.toLowerCase().trim())
        .eq("course_id", courseId);
    }

    return NextResponse.json(
      {
        success: true,
        statementId: statement.id,
        statement,
      },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    console.error("xAPI Statements POST error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", detail: err.message },
      { status: 500, headers: CORS }
    );
  }
}

/**
 * GET /api/xapi/statements
 *
 * Query stored xAPI statements.
 *
 * Query params:
 * - agent (email)
 * - verb (verb ID or short name)
 * - activity (activity IRI)
 * - since (ISO date)
 * - until (ISO date)
 * - limit (number)
 */
export async function GET(req: NextRequest) {
  try {
    if (!verifyBasicAuth(req)) return xapiUnauthorizedResponse();
    const { searchParams } = req.nextUrl;

    const agent = searchParams.get("agent");
    const verb = searchParams.get("verb");
    const activity = searchParams.get("activity");
    const since = searchParams.get("since");
    const until = searchParams.get("until");
    const limit = searchParams.get("limit");

    // Resolve verb short name to full ID if needed
    let verbId = verb;
    if (verb && !verb.startsWith("http")) {
      const verbKey = verb as keyof typeof XAPI_VERBS;
      if (XAPI_VERBS[verbKey]) {
        verbId = XAPI_VERBS[verbKey].id;
      }
    }

    const result = await queryStatements({
      email: agent || undefined,
      verb: verbId || undefined,
      activityId: activity || undefined,
      since: since || undefined,
      until: until || undefined,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500, headers: CORS }
      );
    }

    // Return in xAPI StatementResult format
    return NextResponse.json(
      {
        statements: result.statements.map((s: any) => s.raw_statement || s),
        more: "",
      },
      { status: 200, headers: CORS }
    );
  } catch (err: any) {
    console.error("xAPI Statements GET error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", detail: err.message },
      { status: 500, headers: CORS }
    );
  }
}
