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
    const { fullName, email, phone, password, nationalId } = await req.json();

    // Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { message: "جميع الحقول مطلوبة" },
        { status: 400, headers: CORS }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { message: "كلمة المرور 8 أحرف على الأقل" },
        { status: 400, headers: CORS }
      );
    }
    if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { message: "رقم وطني غير صحيح" },
        { status: 400, headers: CORS }
      );
    }

    // 1. إنشاء مستخدم في Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName, phone },
      });

    if (authError) {
      const msg = authError.message.includes("already registered")
        ? "البريد الإلكتروني مسجل مسبقاً"
        : "فشل إنشاء الحساب";
      return NextResponse.json(
        { message: msg },
        { status: 400, headers: CORS }
      );
    }

    const userId = authData.user.id;

    // 2. إنشاء Contact في GHL
    const nameParts = fullName.trim().split(" ");
    let ghlContactId = null;

    try {
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
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" ") || "-",
            email,
            phone,
            locationId: process.env.GHL_LOCATION_ID,
            tags: [
              "website-registered",
              nationalId ? "nelc-eligible" : "no-nelc",
            ],
          }),
        }
      );
      const ghlData = await ghlRes.json();
      ghlContactId = ghlData?.contact?.id || null;
      console.log("GHL Contact ID:", ghlContactId);
    } catch (ghlErr) {
      console.error("GHL error (non-fatal):", ghlErr);
    }

    // 3. حفظ البيانات في profiles
    await supabase.from("profiles").upsert({
      id: userId,
      full_name: fullName,
      phone,
      national_id: nationalId || null,
      ghl_contact_id: ghlContactId,
      nelc_eligible: !!nationalId,
    });

    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}