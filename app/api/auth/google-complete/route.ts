import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, fullName } = await req.json();

    // تحقق هل المستخدم موجود
    const { data: existing } = await supabase
      .from("profiles")
      .select("ghl_contact_id")
      .eq("id", userId)
      .single();

    let ghlContactId = existing?.ghl_contact_id;

    // إنشاء contact في GHL لو غير موجود
    if (!ghlContactId) {
      const names = (fullName || email.split("@")[0]).split(" ");

      const ghlRes = await fetch(
        "https://services.leadconnectorhq.com/contacts/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
          },
          body: JSON.stringify({
            firstName: names[0],
            lastName: names.slice(1).join(" ") || "-",
            email,
            locationId: process.env.GHL_LOCATION_ID,
          }),
        }
      );

      const ghlData = await ghlRes.json();

      ghlContactId = ghlData?.contact?.id || null;

      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        ghl_contact_id: ghlContactId,
      });
    }

    let redirectUrl = "https://members.nabdtraining.com";

    // إنشاء Magic Link
    if (ghlContactId) {
      const magicRes = await fetch(
        "https://services.leadconnectorhq.com/client-portal/magic-links",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
          },
          body: JSON.stringify({
            contactId: ghlContactId,
            locationId: process.env.GHL_LOCATION_ID,
          }),
        }
      );

      const magicData = await magicRes.json();

      if (magicData?.link) {
        redirectUrl = magicData.link;
      }
    }

    return NextResponse.json({
      success: true,
      redirectUrl,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}
