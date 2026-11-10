import { NextRequest,NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, phone, role, status, avatar_url, created_at, updated_at")
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
        avatarUrl: p.avatar_url || null,
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
