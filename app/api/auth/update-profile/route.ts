import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
    const { email, userId, fullName, phone, nationalId, professionalId } = await req.json();

    // Support both email and userId as identifiers
    const identifier = email || userId;
    if (!identifier) {
      return NextResponse.json(
        { message: "البريد الإلكتروني أو معرّف المستخدم مطلوب" },
        { status: 400, headers: CORS }
      );
    }

    if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { message: "رقم وطني غير صحيح" },
        { status: 400, headers: CORS }
      );
    }

    // Determine which field to match on
    const matchField = email ? "email" : "id";
    const matchValue = email ? email.toLowerCase().trim() : userId;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, ghl_contact_id")
      .eq(matchField, matchValue)
      .maybeSingle();

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from("profiles")
        .update({
          full_name: fullName || undefined,
          phone: phone || null,
          national_id: nationalId || null,
          professional_id: professionalId || null,
          nelc_eligible: !!nationalId,
        })
        .eq(matchField, matchValue);
    } else if (email) {
      // Create new profile if searching by email
      const crypto = await import("crypto");
      result = await supabase
        .from("profiles")
        .insert({
          id: crypto.randomUUID(),
          email: email.toLowerCase().trim(),
          full_name: fullName || null,
          phone: phone || null,
          national_id: nationalId || null,
          professional_id: professionalId || null,
          nelc_eligible: !!nationalId,
        });
    } else {
      return NextResponse.json(
        { message: "البروفايل غير موجود" },
        { status: 404, headers: CORS }
      );
    }

    if (result?.error) {
      throw result.error;
    }

    // Optionally update GHL contact
    if (existingProfile?.ghl_contact_id) {
      try {
        await fetch(
          `https://services.leadconnectorhq.com/contacts/${existingProfile.ghl_contact_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.GHL_API_KEY}`,
              "Content-Type": "application/json",
              Version: "2021-07-28",
            },
            body: JSON.stringify({
              firstName: fullName?.split(" ")[0],
              lastName: fullName?.split(" ").slice(1).join(" ") || "-",
              phone: phone || undefined,
              tags: nationalId ? ["website-registered", "nelc-eligible"] : ["website-registered"],
            }),
          }
        );
      } catch (ghlErr) {
        console.error("GHL Update Error:", ghlErr);
      }
    }

    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err: any) {
    console.error("Update profile error:", err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم", detail: err.message },
      { status: 500, headers: CORS }
    );
  }
}
