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
    const { userId, fullName, phone, nationalId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: "المستخدم غير موجود" },
        { status: 400, headers: CORS }
      );
    }

    if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { message: "رقم وطني غير صحيح" },
        { status: 400, headers: CORS }
      );
    }

    // Update Supabase
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        national_id: nationalId || null,
        nelc_eligible: !!nationalId,
      })
      .eq("id", userId);

    if (updateError) {
      throw updateError;
    }

    // We can also optionally update GHL contact if needed, but for now we just update our DB.
    // If you need to update GHL, we'd fetch the ghl_contact_id first.
    const { data: profile } = await supabase
      .from("profiles")
      .select("ghl_contact_id")
      .eq("id", userId)
      .single();

    if (profile?.ghl_contact_id) {
      try {
        const customFields = [];
        if (nationalId) {
            // we will need the actual custom field ID here if we want to update it via API
            // but we can also just update tags.
            customFields.push({ id: "Z9wz4Vn0yJq0c2eO8H4y", key: "contact.national_id", field_value: nationalId });
        }

        await fetch(
          `https://services.leadconnectorhq.com/contacts/${profile.ghl_contact_id}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${process.env.GHL_API_KEY}`,
              "Content-Type": "application/json",
              Version: "2021-07-28",
            },
            body: JSON.stringify({
              firstName: fullName.split(" ")[0],
              lastName: fullName.split(" ").slice(1).join(" ") || "-",
              phone: phone || undefined,
              tags: nationalId ? ["website-registered", "nelc-eligible"] : ["website-registered"],
              // customFields: customFields
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
      { message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}
