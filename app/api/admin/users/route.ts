import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, role, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json({ message: profilesError.message }, { status: 500 });
    }

    const { data: enrollments } = await supabaseAdmin
      .from("enrollments")
      .select("email, course_id, progress");

    const enrollmentMap = new Map<string, number>();
    const completedMap = new Map<string, number>();

    if (enrollments) {
      enrollments.forEach((e) => {
        const em = (e.email || "").toLowerCase().trim();
        if (em) {
          enrollmentMap.set(em, (enrollmentMap.get(em) || 0) + 1);
          if (Number(e.progress) >= 100) {
            completedMap.set(em, (completedMap.get(em) || 0) + 1);
          }
        }
      });
    }

    const users = (profiles || []).map((p) => {
      const emailClean = (p.email || "").toLowerCase().trim();
      const rawRole = (p.role || "STUDENT").toUpperCase();
      const mappedRole: "طالب" | "مدرب" | "أدمن" =
        rawRole === "ADMIN" || rawRole === "SUPERADMIN" || rawRole === "SUPER_ADMIN"
          ? "أدمن"
          : rawRole === "INSTRUCTOR" || rawRole === "TRAINER" || rawRole === "TEACHER"
          ? "مدرب"
          : "طالب";

      return {
        id: p.id,
        name: p.full_name || emailClean.split("@")[0] || "مستخدم",
        email: p.email || "",
        phone: p.phone || "غير مسجل",
        role: mappedRole,
        enrolledCourses: enrollmentMap.get(emailClean) || 0,
        certificatesCount: completedMap.get(emailClean) || 0,
        status: (p.status === "suspended" ? "suspended" : "active") as "active" | "suspended",
        lastActive: "نشط",
        attendanceRate: "100%",
      };
    });

    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    console.error("List users error:", err);
    return NextResponse.json(
      { message: err.message || "حدث خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const email = searchParams.get("email")?.toLowerCase().trim();

    if (!userId && !email) {
      return NextResponse.json({ message: "معرف المستخدم أو البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    // Safety check: Prevent deleting current logged-in admin
    if ((userId && auth.user.id === userId) || (email && auth.user.email?.toLowerCase().trim() === email)) {
      return NextResponse.json({ message: "لا يمكنك حذف حسابك الحالي المسجل به الدخول!" }, { status: 400 });
    }

    // 1. Delete user from Supabase Auth
    if (userId) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (authErr) {
        console.warn("Auth user deletion warning:", authErr);
      }
    } else if (email) {
      try {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = listData?.users?.find((u) => u.email?.toLowerCase() === email);
        if (existingUser) {
          await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
        }
      } catch (authErr) {
        console.warn("Auth user lookup & deletion warning:", authErr);
      }
    }

    // 2. Clean up from profiles table
    if (userId) {
      await supabaseAdmin.from("profiles").delete().eq("id", userId);
    }
    if (email) {
      await supabaseAdmin.from("profiles").delete().eq("email", email);
      // Also clean up enrollments
      await supabaseAdmin.from("enrollments").delete().eq("email", email);
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف الحساب وكافة بياناته نهائياً بنجاح.",
    });
  } catch (err: any) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { message: err.message || "حدث خطأ أثناء حذف الحساب" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const body = await req.json();
    const { userId, status } = body;

    if (!userId || !['active', 'suspended'].includes(status)) {
      return NextResponse.json(
        { message: 'معرف المستخدم وحالة صالحة مطلوبان' },
        { status: 400 }
      );
    }

    // Prevent self-suspension
    if (userId === auth.user.id) {
      return NextResponse.json(
        { message: 'لا يمكنك تعليق حسابك الحالي' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Status update error:', error);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: status === 'suspended' ? 'تم تعليق الحساب بنجاح' : 'تم تفعيل الحساب بنجاح',
    });
  } catch (err: any) {
    console.error('Patch user error:', err);
    return NextResponse.json(
      { message: err.message || 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
