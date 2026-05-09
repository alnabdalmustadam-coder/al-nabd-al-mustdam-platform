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
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "أدخل البريد الإلكتروني وكلمة المرور" },
        { status: 400, headers: CORS }
      );
    }

    // 1. تحقق من Supabase Auth
    const { data: authData, error } =
      await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return NextResponse.json(
        { message: "بيانات غير صحيحة" },
        { status: 401, headers: CORS }
      );
    }

    // 2. جيب الـ GHL Contact ID من profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("ghl_contact_id")
      .eq("id", authData.user.id)
      .single();

    // 3. اطلب Magic Link من GHL
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
        console.log("Magic Link Response:", JSON.stringify(magicData));
        if (magicData?.link) redirectUrl = magicData.link;
      } catch (magicErr) {
        console.error("Magic link error (non-fatal):", magicErr);
      }
    }

    return NextResponse.json(
      { success: true, redirectUrl },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}
