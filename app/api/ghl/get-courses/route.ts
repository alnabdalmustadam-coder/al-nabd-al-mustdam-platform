import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/ghl/get-courses?email=xxx
 *
 * Hybrid course fetching:
 * 1. يقرأ من جدول enrollments في Supabase (المصدر الرئيسي)
 * 2. يكمل من GHL Tags كـ fallback (إذا فيه كورسات مسجلة بدون webhook)
 * 3. يدمج النتائج بدون تكرار
 */

// الكورسات الافتراضية (تظهر للجميع حتى يتم إضافة كورسات حقيقية في GHL)
const DEFAULT_COURSES = [
  {
    course_id: "course-haceb",
    title: "استخدام الحاسب الآلي في الأعمال المكتبية",
    course_url: "https://members.nabdtraining.com",
    tag: "course-haceb",
  },
  {
    course_id: "course-data-entry",
    title: "دورات ادخال بيانات ومعالجة نصوص",
    course_url: "https://members.nabdtraining.com",
    tag: "course-data-entry",
  },
  {
    course_id: "course-english",
    title: "دورة اللغة الانجليزية",
    course_url: "https://members.nabdtraining.com",
    tag: "course-english",
  },
];

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // ========== 1. Fetch from Supabase enrollments (PRIMARY) ==========
    const { data: dbEnrollments, error: dbError } = await supabase
      .from("enrollments")
      .select("*")
      .eq("email", normalizedEmail)
      .order("enrolled_at", { ascending: false });

    if (dbError) {
      console.error("Enrollments DB error:", dbError);
    }

    const enrollments = dbEnrollments || [];

    // ========== 2. Fetch from GHL Tags (FALLBACK) ==========
    let ghlTagCourses: any[] = [];
    let ghlContactId: string | null = null;

    try {
      const searchRes = await fetch(
        `https://services.leadconnectorhq.com/contacts/?locationId=${process.env.GHL_LOCATION_ID}&query=${normalizedEmail}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
            Version: "2021-07-28",
            Accept: "application/json",
          },
        }
      );

      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const contact = searchData.contacts?.[0];

        if (contact) {
          ghlContactId = contact.id;
          const tags: string[] = contact.tags || [];

          // Map GHL tags to courses
          ghlTagCourses = DEFAULT_COURSES
            .filter((c) => tags.includes(c.tag))
            .map((c) => ({
              course_id: c.course_id,
              title: c.title,
              course_url: c.course_url,
              progress: 0,
              status: "active",
              source: "ghl_tag",
            }));
        }
      }
    } catch (ghlErr) {
      console.error("GHL fetch error (non-fatal):", ghlErr);
    }

    // ========== 3. Merge results (enrollments take priority) ==========
    const enrolledIds = new Set(enrollments.map((e) => e.course_id));

    // Add GHL tag courses that aren't already in enrollments
    const newFromGhl = ghlTagCourses.filter((c) => !enrolledIds.has(c.course_id));

    const allCourses = [
      ...enrollments.map((e) => ({
        course_id: e.course_id,
        title: e.course_title,
        course_url: e.course_url || "https://members.nabdtraining.com",
        progress: e.progress || 0,
        status: e.status || "active",
        enrolled_at: e.enrolled_at,
        completed_at: e.completed_at,
        source: "enrollment",
      })),
      ...newFromGhl,
    ];

    return NextResponse.json({
      contactId: ghlContactId,
      courses: allCourses,
      totalEnrolled: allCourses.length,
      completedCount: allCourses.filter((c) => c.status === "completed").length,
    });
  } catch (err) {
    console.error("Get courses error:", err);
    return NextResponse.json({ message: "حدث خطأ في جلب الدورات" }, { status: 500 });
  }
}
