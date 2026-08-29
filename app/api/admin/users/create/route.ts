import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/security/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();
    const { fullName, email, password, phone, nationalId, role = "STUDENT" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: "يرجى ملء الاسم الكامل، البريد الإلكتروني، وكلمة المرور" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const targetRole = ["ADMIN", "INSTRUCTOR", "STUDENT"].includes(role?.toUpperCase())
      ? role.toUpperCase()
      : "STUDENT";

    // 1. Try to create user via Supabase Admin Auth
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || "",
        national_id: nationalId || "",
      },
      app_metadata: { role: targetRole },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes("already registered") || createError.message?.toLowerCase().includes("exists")) {
        return NextResponse.json(
          { message: "هذا البريد الإلكتروني مسجل مسبقاً في المنصة. لا يمكن تكرار البريد لحساب آخر." },
          { status: 400 }
        );
      }
      return NextResponse.json({ message: createError.message }, { status: 400 });
    }

    const userId = createData.user?.id;
    if (!userId) {
      return NextResponse.json({ message: "فشل إنشاء معرف المستخدم في النظام" }, { status: 500 });
    }

    // 2. Upsert profile with selected role
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        phone: phone || null,
        national_id: nationalId || null,
        role: targetRole,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    const roleNameAr =
      targetRole === "ADMIN" ? "مدير النظام (أدمن)" : targetRole === "INSTRUCTOR" ? "مدرب ومعلم" : "متدرب وطالب";

    return NextResponse.json({
      success: true,
      message: `تم إنشاء حساب ${roleNameAr} واعتماده بنجاح! يمكنه الآن تسجيل الدخول مباشرة.`,
      user: {
        id: userId,
        email: cleanEmail,
        name: fullName,
        role: targetRole,
      },
    });
  } catch (err: any) {
    console.error("Create user error:", err);
    return NextResponse.json(
      { message: err.message || "حدث خطأ غير متوقع في الخادم" },
      { status: 500 }
    );
  }
}
