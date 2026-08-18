import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "غير مصرح: يرجى تسجيل الدخول أولاً" }, { status: 401 });
    }

    const requestedUserId = req.nextUrl.searchParams.get("userId") || user.id;

    // Security Check: If requesting another user's profile, verify that caller is ADMIN
    if (requestedUserId !== user.id) {
      const { data: callerProfile } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const callerRole = (callerProfile?.role || "").toUpperCase();
      if (callerRole !== "ADMIN") {
        return NextResponse.json({ message: "غير مصرح بالوصول إلى بيانات هذا المستخدم" }, { status: 403 });
      }
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", requestedUserId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, profile: profile || null });
  } catch (err) {
    console.error("Secure Get Profile Error:", err);
    return NextResponse.json({ message: "حدث خطأ أثناء جلب الملف الشخصي" }, { status: 500 });
  }
}
