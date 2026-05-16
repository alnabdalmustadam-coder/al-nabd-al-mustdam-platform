import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * xAPI Activity State API — /api/xapi/activities/state
 *
 * Implements the Activities State Resource per xAPI 1.0.3 spec.
 * Stores and retrieves learner state for a specific activity.
 *
 * Query params:
 * - activityId: The activity IRI
 * - agent: Learner email
 * - stateId: State document ID
 * - registration: Optional registration UUID
 *
 * Reference: https://github.com/adlnet/xAPI-Spec/blob/master/xAPI-Communication.md#activitiesstate
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Experience-API-Version",
  "X-Experience-API-Version": "1.0.3",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

/**
 * GET /api/xapi/activities/state
 * Retrieve state document(s)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const activityId = searchParams.get("activityId");
    const agent = searchParams.get("agent");
    const stateId = searchParams.get("stateId");
    const registration = searchParams.get("registration");

    if (!activityId || !agent) {
      return NextResponse.json(
        { success: false, message: "activityId and agent are required" },
        { status: 400, headers: CORS }
      );
    }

    let query = supabase
      .from("xapi_state")
      .select("*")
      .eq("activity_id", activityId)
      .eq("agent_email", agent.toLowerCase().trim());

    if (stateId) query = query.eq("state_id", stateId);
    if (registration) query = query.eq("registration", registration);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers: CORS }
      );
    }

    // If stateId was specified, return single state document
    if (stateId && data && data.length > 0) {
      return NextResponse.json(data[0].state_data, { headers: CORS });
    }

    // Otherwise return list of stateIds
    return NextResponse.json(
      (data || []).map((d: any) => d.state_id),
      { headers: CORS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: CORS }
    );
  }
}

/**
 * PUT/POST /api/xapi/activities/state
 * Store or update a state document
 */
export async function PUT(req: NextRequest) {
  return handlePutPost(req);
}

export async function POST(req: NextRequest) {
  return handlePutPost(req);
}

async function handlePutPost(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const activityId = searchParams.get("activityId");
    const agent = searchParams.get("agent");
    const stateId = searchParams.get("stateId");
    const registration = searchParams.get("registration");

    if (!activityId || !agent || !stateId) {
      return NextResponse.json(
        {
          success: false,
          message: "activityId, agent, and stateId are required",
        },
        { status: 400, headers: CORS }
      );
    }

    const stateData = await req.json();
    const normalizedEmail = agent.toLowerCase().trim();

    // Upsert the state
    const { error } = await supabase.from("xapi_state").upsert(
      {
        activity_id: activityId,
        agent_email: normalizedEmail,
        state_id: stateId,
        registration: registration || null,
        state_data: stateData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "activity_id,agent_email,state_id",
      }
    );

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers: CORS }
      );
    }

    return new NextResponse(null, { status: 204, headers: CORS });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: CORS }
    );
  }
}

/**
 * DELETE /api/xapi/activities/state
 * Delete a state document
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const activityId = searchParams.get("activityId");
    const agent = searchParams.get("agent");
    const stateId = searchParams.get("stateId");

    if (!activityId || !agent) {
      return NextResponse.json(
        { success: false, message: "activityId and agent are required" },
        { status: 400, headers: CORS }
      );
    }

    let query = supabase
      .from("xapi_state")
      .delete()
      .eq("activity_id", activityId)
      .eq("agent_email", agent.toLowerCase().trim());

    if (stateId) query = query.eq("state_id", stateId);

    const { error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 500, headers: CORS }
      );
    }

    return new NextResponse(null, { status: 204, headers: CORS });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500, headers: CORS }
    );
  }
}
