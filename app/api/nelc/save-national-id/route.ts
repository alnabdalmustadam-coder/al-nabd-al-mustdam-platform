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

    // 1. Check if profile exists by email
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email.toLowerCase().trim())
      .single();

    let result;

    if (existingProfile) {
      // 2. Update existing profile
      result = await supabase
        .from("profiles")
        .update({
          national_id: nationalId,
          nelc_eligible: true,
        })
        .eq("email", email.toLowerCase().trim());
    } else {
      // 3. Create new profile with a generated UUID
      // We use crypto.randomUUID() or a similar method if available, 
      // but since we are in Node/Next.js, we can use a library or just let Supabase handle it if possible.
      // However, to be safe with the PK constraint, we generate one.
      const tempId = crypto.randomUUID();
      result = await supabase
        .from("profiles")
        .insert({
          id: tempId,
          email: email.toLowerCase().trim(),
          national_id: nationalId,
          nelc_eligible: true,
        });
    }

    if (result.error) {
      console.error("Supabase save-national-id error detail:", JSON.stringify(result.error));
      return NextResponse.json(
        { success: false, message: "Database error", detail: result.error.message },
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
