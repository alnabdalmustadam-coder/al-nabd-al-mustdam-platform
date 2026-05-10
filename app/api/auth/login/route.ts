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

    // 3. توجيه المستخدم للداشبورد مباشرة
    let redirectUrl = "/dashboard";

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
