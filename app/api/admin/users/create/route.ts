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
    const {
      fullName,
      email,
      password,
      phone,
      nationalId,
      role = "STUDENT",
      selectedCourseSlugs = [],
      customCourseTitle = "",
    } = body;

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
        role: targetRole,
      },
      app_metadata: { role: targetRole },
    });

    if (createError) {
      if (
        createError.message?.toLowerCase().includes("already registered") ||
        createError.message?.toLowerCase().includes("exists")
      ) {
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

    // 2. Upsert profile with selected role and details
    const { error: profileError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        email: cleanEmail,
        full_name: fullName,
        phone: phone || null,
        national_id: nationalId || null,
        role: targetRole,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.error("Profile upsert notice:", profileError);
    }

    // 3. Resolve Target Courses (Existing + Optional Custom Course)
    const allCourses = await getAllCoursesAsync({ includeUnpublished: true });
    const targetCourses: { slug: string; title: string; id?: number | string }[] = [];

    if (Array.isArray(selectedCourseSlugs) && selectedCourseSlugs.length > 0) {
      for (const slugOrId of selectedCourseSlugs) {
        const clean = String(slugOrId).toLowerCase().trim();
        const matched = allCourses.find(
          (c) => c.slug.toLowerCase() === clean || String(c.id) === clean
        );
        if (matched && !targetCourses.some((t) => t.slug === matched.slug)) {
          targetCourses.push({ slug: matched.slug, title: matched.title, id: matched.id });
        }
      }
    }

    // Handle Custom Course Title if provided
    if (customCourseTitle && typeof customCourseTitle === "string" && customCourseTitle.trim()) {
      const cleanCustom = customCourseTitle.trim();
      if (!targetCourses.some((t) => t.title.toLowerCase() === cleanCustom.toLowerCase())) {
        const generatedSlug =
          cleanCustom
            .toLowerCase()
            .replace(/[^a-z0-9\u0600-\u06ff\s_-]/gu, "")
            .replace(/[\s_]+/g, "-")
            .slice(0, 50) || `course-${Date.now().toString(36)}`;

        targetCourses.push({ slug: generatedSlug, title: cleanCustom });

        // If creating an instructor with a new course, save the course to catalog
        if (targetRole === "INSTRUCTOR") {
          try {
            await saveCourseAsync(
              {
                title: cleanCustom,
                slug: generatedSlug,
                instructor: fullName,
                trainerId: userId,
                price: 0,
                category: "management",
                level: "all",
                status: "published",
                description: `برنامج تدريبي معتمد تحت إشراف المدرب ${fullName}`,
              },
              userId
            );
          } catch (createCourseErr) {
            console.warn("Notice saving instructor custom course:", createCourseErr);
          }
        }
      }
    }

    // 4. Enroll Student in Target Courses
    const enrolledCourseTitles: string[] = [];
    if (targetRole === "STUDENT" && targetCourses.length > 0) {
      for (const course of targetCourses) {
        try {
          // Check if already enrolled
          const { data: existing } = await supabaseAdmin
            .from("enrollments")
            .select("id")
            .eq("email", cleanEmail)
            .eq("course_id", course.slug)
            .maybeSingle();

          if (!existing) {
            await supabaseAdmin.from("enrollments").insert({
              user_id: userId,
              email: cleanEmail,
              course_id: course.slug,
              course_title: course.title,
              course_url: `/courses/${course.slug}`,
              progress: 0,
              status: "active",
              enrolled_at: new Date().toISOString(),
            });
          }
          enrolledCourseTitles.push(course.title);
        } catch (enrollErr) {
          console.error("Error enrolling student in course:", course.title, enrollErr);
        }
      }
    }

    // 5. Assign Instructor to Target Courses
    const assignedCourseTitles: string[] = [];
    if (targetRole === "INSTRUCTOR" && targetCourses.length > 0) {
      for (const course of targetCourses) {
        try {
          const existing = allCourses.find(
            (c) => c.slug === course.slug || String(c.id) === String(course.id)
          );
          if (existing) {
            await saveCourseAsync(
              {
                ...existing,
                instructor: fullName,
                trainerId: userId,
              },
              userId
            );
            assignedCourseTitles.push(existing.title);
          } else {
            assignedCourseTitles.push(course.title);
          }
        } catch (assignErr) {
          console.error("Error assigning instructor to course:", course.title, assignErr);
        }
      }
    }

    const roleNameAr =
      targetRole === "ADMIN"
        ? "مدير النظام (أدمن)"
        : targetRole === "INSTRUCTOR"
        ? "مدرب ومعلم"
        : "متدرب وطالب";

    return NextResponse.json({
      success: true,
      message: `تم إنشاء حساب ${roleNameAr} واعتماده بنجاح!`,
      user: {
        id: userId,
        email: cleanEmail,
        name: fullName,
        role: targetRole,
        enrolledCourses: enrolledCourseTitles,
        assignedCourses: assignedCourseTitles,
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

