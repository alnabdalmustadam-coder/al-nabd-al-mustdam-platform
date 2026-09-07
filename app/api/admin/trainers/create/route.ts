import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/security/auth";
import { getAllCoursesAsync, saveCourseAsync } from "@/lib/courses-store";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();
    const { fullName, email, password, specialty, phone, avatarUrl, assignedCourseSlugs } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { message: "يرجى ملء الاسم الكامل، البريد الإلكتروني، وكلمة المرور" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Try to create user via Supabase Admin Auth
    let userId: string | null = null;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        avatar_url: avatarUrl || null,
      },
      app_metadata: { role: "INSTRUCTOR" },
    });

    if (createError) {
      if (createError.message?.toLowerCase().includes("already registered") || createError.message?.toLowerCase().includes("exists")) {
        return NextResponse.json(
          { message: "هذا البريد الإلكتروني مسجل مسبقاً في النظام. للحفاظ على فصل الأدوار، يجب استخدام بريد إلكتروني مخصص وجديد لكل مدرب." },
          { status: 400 }
        );
      }
      return NextResponse.json({ message: createError.message }, { status: 400 });
    }

    userId = createData.user?.id || null;

    if (!userId) {
      return NextResponse.json({ message: "فشل إنشاء معرف المستخدم في النظام" }, { status: 500 });
    }

    const defaultAvatar = /أمال|ميسون|عهود|سارة|نورة|فاطمة|المدربة|دكتورة|محامية/.test(fullName)
      ? '/trainer-default-female.webp'
      : '/trainer-default-male.webp';
    const finalAvatarUrl = avatarUrl || defaultAvatar;

    // 2. Upsert profile with role = 'INSTRUCTOR'
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        phone: phone || null,
        bio: specialty || "مدرب ومحاضر معتمد",
        specialty: specialty || "مدرب ومحاضر معتمد",
        avatar_url: finalAvatarUrl,
        status: "active",
        role: "INSTRUCTOR",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile upsert error:", profileError);
    }

    // 3. Assign Trainer to Target Courses if requested
    if (Array.isArray(assignedCourseSlugs) && assignedCourseSlugs.length > 0) {
      try {
        const allCourses = await getAllCoursesAsync({ includeUnpublished: true });
        const targetSlugs = new Set(assignedCourseSlugs.map((s: string) => String(s).toLowerCase().trim()));

        for (const course of allCourses) {
          if (targetSlugs.has(course.slug.toLowerCase())) {
            await saveCourseAsync(
              {
                ...course,
                instructor: fullName,
                trainerId: userId,
              },
              userId
            );
          }
        }
      } catch (assignErr) {
        console.warn("Notice assigning courses to new trainer:", assignErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "تم إنشاء حساب المدرب واعتماده بنجاح! يمكنه الآن تسجيل الدخول مباشرة.",
      trainer: { id: userId, email: cleanEmail, fullName, role: "INSTRUCTOR", avatarUrl: avatarUrl || null },
    });
  } catch (err: any) {
    console.error("Create trainer error:", err);
    return NextResponse.json(
      { message: err.message || "حدث خطأ غير متوقع في الخادم" },
      { status: 500 }
    );
  }
}
