import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * POST /api/nelc/save-national-id
 *
 * يُستدعى من السكريبت المحقون في صفحة GHL Client Portal Sign Up
 * يستقبل { email, nationalId } ويحفظهم في Supabase profiles
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
    const { email, nationalId } = await req.json();

    if (!email || !nationalId) {
      return NextResponse.json(
        { success: false, message: "email and nationalId are required" },
        { status: 400, headers: CORS }
      );
    }

    // Validate National ID format (Saudi: starts with 1, Resident: 2, GCC: 4)
    if (!/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { success: false, message: "Invalid National ID format" },
        { status: 400, headers: CORS }
      );
    }

    // Upsert into profiles — save National ID linked to email
    // Note: We use email as the conflict target. If id is required, this might fail unless id has a default or is nullable.
    const { error } = await supabase.from("profiles").upsert(
      {
        email: email.toLowerCase().trim(),
        national_id: nationalId,
        nelc_eligible: true,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("Supabase save-national-id error detail:", JSON.stringify(error));
      return NextResponse.json(
        { success: false, message: "Database error", detail: error.message },
        { status: 500, headers: CORS }
      );
    }

    console.log(`NELC: National ID saved for ${email}`);
    return NextResponse.json({ success: true, message: "Saved successfully" }, { headers: CORS });
  } catch (err: any) {
    console.error("save-national-id error:", err);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500, headers: CORS }
    );
  }
}
