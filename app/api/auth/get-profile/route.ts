import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { isAdminRole, requireUser } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const user = auth.user;

    const requestedUserId = req.nextUrl.searchParams.get("userId") || user.id;

    // Security Check: If requesting another user's profile, verify that caller is ADMIN
    if (requestedUserId !== user.id) {
      if (!isAdminRole(auth.role)) {
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
