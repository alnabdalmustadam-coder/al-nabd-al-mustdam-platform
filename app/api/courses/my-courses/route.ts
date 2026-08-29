import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireUser } from "@/lib/security/auth";

const CORS = {
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const email = auth.user.email;
    if (!email) {
      return NextResponse.json(
        { success: false, message: "البريد الإلكتروني مطلوب" },
        { status: 400, headers: CORS }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Query enrollments from Supabase local table
    const { data: enrollments, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("email", normalizedEmail)
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Fetch local courses error:", error);
      return NextResponse.json(
        { success: false, message: "فشل جلب الدورات من قاعدة البيانات", error: error.message },
        { status: 500, headers: CORS }
      );
    }

    // Map keys to frontend expectation (course_title -> title)
    const courses = (enrollments || []).map((e) => ({
      id: e.id,
      course_id: e.course_id,
      title: e.course_title,
      course_url: e.course_url,
      progress: e.progress || 0,
      status: e.status,
      is_evaluated: e.is_evaluated,
      enrolled_at: e.enrolled_at,
      completed_at: e.completed_at,
    }));

    const completedCount = courses.filter((c) => c.status === "completed" || c.progress === 100).length;

    return NextResponse.json(
      { success: true, courses, completedCount },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("Local get-courses route error:", err);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}
