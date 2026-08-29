import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { checkRateLimit } from "@/lib/security/rate-limit";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = checkRateLimit(req, 'auth-register', 5, 60 * 60 * 1000);
    if (rateLimited) return rateLimited;

    const { fullName, email, phone, password, nationalId } = await req.json();

    // Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { message: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }
    if (
      password.length < 8 ||
      password.length > 128 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      (!/[0-9]/.test(password) && !/[^A-Za-z0-9]/.test(password))
    ) {
      return NextResponse.json(
        { message: "كلمة المرور 8 أحرف على الأقل" },
        { status: 400 }
      );
    }
    if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { message: "رقم وطني غير صحيح" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: { full_name: fullName, phone, national_id: nationalId || null },
        },
      });

    if (authError) {
      const msg = authError.message.includes("already registered")
        ? "البريد الإلكتروني مسجل مسبقاً"
        : "فشل إنشاء الحساب";
      return NextResponse.json(
        { message: msg },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, requiresEmailVerification: !authData.session });
  } catch (err: unknown) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}
