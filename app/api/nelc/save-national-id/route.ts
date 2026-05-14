import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

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
    const { email, nationalId, fullName, professionalId } = await req.json();

    if (!email || !nationalId) {
      return NextResponse.json(
        { success: false, message: "Email and National ID are required" },
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

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if profile exists by email
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    let result;

    if (existingProfile) {
      // 2. Update existing profile
      result = await supabase
        .from("profiles")
        .update({
          national_id: nationalId,
          nelc_eligible: true,
          ...(fullName ? { full_name: fullName } : {}),
          ...(professionalId ? { professional_id: professionalId } : {})
        })
        .eq("email", cleanEmail);
    } else {
      // 3. Create new profile
      const tempId = crypto.randomUUID();
      result = await supabase
        .from("profiles")
        .insert({
          id: tempId,
          email: cleanEmail,
          national_id: nationalId,
          nelc_eligible: true,
          ...(fullName ? { full_name: fullName } : {}),
          ...(professionalId ? { professional_id: professionalId } : {})
        });
    }

    if (result.error) {
      console.error("Supabase Operation Error:", result.error);
      return NextResponse.json(
        { 
          success: false, 
          message: "Database operation failed", 
          detail: result.error.message,
          hint: result.error.hint
        },
        { status: 500, headers: CORS }
      );
    }

    console.log(`NELC Success: National ID ${nationalId} saved for ${cleanEmail}`);
    return NextResponse.json({ success: true, message: "Data synchronized successfully" }, { headers: CORS });

  } catch (err: any) {
    console.error("save-national-id error:", err);
    return NextResponse.json(
      { success: false, message: "Server error", detail: err.message },
      { status: 500, headers: CORS }
    );
  }
}
