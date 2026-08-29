import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/security/auth";

const CORS = {
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;

    const { fullName, phone, nationalId, professionalId } = await req.json();
    const userId = auth.user.id;

    if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { message: "رقم وطني غير صحيح" },
        { status: 400, headers: CORS }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, ghl_contact_id")
      .eq('id', userId)
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
        .eq('id', userId);
    } else {
      result = await supabase
        .from("profiles")
        .insert({
          id: userId,
          email: auth.user.email?.toLowerCase().trim(),
          full_name: fullName || null,
          phone: phone || null,
          national_id: nationalId || null,
          professional_id: professionalId || null,
          nelc_eligible: !!nationalId,
        });
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
              ...(nationalId ? {
                customFields: [
                  {
                    id: "pJyAoTaiWlxLe5vf64c1",
                    key: "contact.national_id",
                    field_value: nationalId
                  }
                ]
              } : {})
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
