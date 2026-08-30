import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getTrustedRole, isAdminRole, isInstructorRole } from "@/lib/security/auth";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = checkRateLimit(req, 'auth-login', 10, 15 * 60 * 1000);
    if (rateLimited) return rateLimited;

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "أدخل البريد الإلكتروني وكلمة المرور" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData, error } =
      await supabase.auth.signInWithPassword({ email: email.toLowerCase().trim(), password });

    if (error) {
      return NextResponse.json(
        { message: "بيانات غير صحيحة" },
        { status: 401 }
      );
    }

    // Determine redirect URL from the server-controlled role claim only.
    const userRole = getTrustedRole(authData.user);
    let redirectUrl = "/dashboard/student";
    if (isAdminRole(userRole)) {
      redirectUrl = "/dashboard/admin";
    } else if (isInstructorRole(userRole)) {
      redirectUrl = "/dashboard/instructor";
    }

    return NextResponse.json({ success: true, redirectUrl });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
