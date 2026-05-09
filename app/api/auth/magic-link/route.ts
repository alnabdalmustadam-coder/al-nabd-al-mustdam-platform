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
  const { userId } = await req.json();

  const { data: profile } = await supabase
    .from("profiles")
    .select("ghl_contact_id")
    .eq("id", userId)
    .single();

  let redirectUrl = "https://members.nabdtraining.com";

  if (profile?.ghl_contact_id) {
    try {
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
            contactId: profile.ghl_contact_id,
            locationId: process.env.GHL_LOCATION_ID,
          }),
        }
      );
      const magicData = await magicRes.json();
      if (magicData?.link) redirectUrl = magicData.link;
    } catch (e) {
      console.error("Magic link error:", e);
    }
  }

  return NextResponse.json({ redirectUrl }, { headers: CORS });
}
