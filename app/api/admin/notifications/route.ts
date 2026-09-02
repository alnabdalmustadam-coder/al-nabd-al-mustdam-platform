import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { requireAdmin } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Fetch real notifications from database
    const { data: dbNotifications, error } = await supabaseAdmin
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    let notifications: any[] = [];

    if (!error && dbNotifications && dbNotifications.length > 0) {
      notifications = dbNotifications.map((n: any) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        type: n.type || "info",
        unread: !n.is_read,
        link: n.link || null,
        time: n.created_at
          ? new Date(n.created_at).toLocaleString("ar-SA", {
              dateStyle: "short",
              timeStyle: "short",
            })
          : "",
      }));
    } else {
      // 2. Fallback: Query real platform activities (latest users & course enrollments)
      const [profilesRes, enrollmentsRes] = await Promise.all([
        supabaseAdmin
          .from("profiles")
          .select("id, full_name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabaseAdmin
          .from("enrollments")
          .select("id, email, course_title, enrolled_at")
          .order("enrolled_at", { ascending: false })
          .limit(5),
      ]);

      const events: any[] = [];

      if (profilesRes.data) {
        profilesRes.data.forEach((p) => {
          if (p.created_at) {
            events.push({
              id: `user-${p.id}`,
              title: p.role === "INSTRUCTOR" ? "انضمام مدرب جديد" : "تسجيل متدرب جديد",
              desc: `تم إنشاء حساب ${p.role === "INSTRUCTOR" ? "المدرب" : "المتدرب"} (${p.full_name || "عضو جديد"}) في المنصة`,
              type: "user",
              unread: false,
              link: "/dashboard/admin/users",
              timestamp: new Date(p.created_at).getTime(),
              time: new Date(p.created_at).toLocaleString("ar-SA", {
                dateStyle: "short",
                timeStyle: "short",
              }),
            });
          }
        });
      }

      if (enrollmentsRes.data) {
        enrollmentsRes.data.forEach((e) => {
          if (e.enrolled_at) {
            events.push({
              id: `enroll-${e.id}`,
              title: "اشتراك في دورة تدريبية",
              desc: `تم تسجيل اشتراك جديد في: ${e.course_title || "دورة تدريبية"}`,
              type: "course",
              unread: false,
              link: "/dashboard/admin/courses",
              timestamp: new Date(e.enrolled_at).getTime(),
              time: new Date(e.enrolled_at).toLocaleString("ar-SA", {
                dateStyle: "short",
                timeStyle: "short",
              }),
            });
          }
        });
      }

      events.sort((a, b) => b.timestamp - a.timestamp);
      notifications = events.slice(0, 10);
    }

    const unreadCount = notifications.filter((n) => n.unread).length;

    return NextResponse.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err: any) {
    console.error("Admin notifications error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const supabaseAdmin = getSupabaseAdmin();
    const body = await req.json();

    if (body.action === "mark_all_read") {
      await supabaseAdmin.from("notifications").update({ is_read: true }).eq("is_read", false);
      return NextResponse.json({ success: true, message: "تم تحديث كافة الإشعارات كمقروءة" });
    }

    if (body.action === "mark_read" && body.id && !body.id.startsWith("user-") && !body.id.startsWith("enroll-")) {
      await supabaseAdmin.from("notifications").update({ is_read: true }).eq("id", body.id);
      return NextResponse.json({ success: true, message: "تم تحديث الإشعار كمقروء" });
    }

    return NextResponse.json({ success: true, message: "تم التحديث بنجاح" });
  } catch (err: any) {
    console.error("Error updating notifications:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
