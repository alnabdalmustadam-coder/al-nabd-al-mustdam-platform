import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildActor, buildStatement, XAPI_VERBS, ACTIVITY_TYPES, stmtProgressed, stmtCompleted, storeStatement } from "@/lib/xapi";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function POST(req: NextRequest) {
  try {
    const { email, courseId, courseTitle, lessonId, lessonTitle, totalLessons } = await req.json();

    if (!email || !courseId || !courseTitle || !lessonId || !lessonTitle || !totalLessons) {
      return NextResponse.json(
        { success: false, message: "كل الحقول مطلوبة" },
        { status: 400, headers: CORS }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const PLATFORM_IRI = "https://nabdtraining.com";

    // 1. Fetch profile to get name and national ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const name = profile?.full_name || normalizedEmail.split("@")[0];
    const nationalId = profile?.national_id || "";

    // 2. Store Lesson Completion statement in xAPI
    try {
      const actor = buildActor({ email: normalizedEmail, name, nationalId });
      
      const lessonActivity = {
        objectType: "Activity" as const,
        id: `${PLATFORM_IRI}/courses/${courseId}/lessons/${lessonId}`,
        definition: {
          type: "http://adlnet.gov/expapi/activities/lesson",
          name: {
            "ar-SA": lessonTitle,
            "en-US": lessonTitle,
          },
        },
      };

      const lessonStatement = buildStatement({
        actor,
        verb: {
          id: "http://adlnet.gov/expapi/verbs/completed",
          display: { "en-US": "completed", "ar-SA": "أكمل" },
        },
        object: lessonActivity,
        result: {
          completion: true,
        },
      });

      await storeStatement(lessonStatement);
      console.log(`📋 xAPI Lesson completion statement stored: ${lessonTitle} for ${normalizedEmail}`);
    } catch (xapiErr) {
      console.error("Non-fatal: failed to store xAPI lesson statement:", xapiErr);
    }

    // 3. Count unique completed lessons for this course
    const { data: completions, error: countError } = await supabase
      .from("xapi_statements")
      .select("object_id")
      .eq("actor_email", normalizedEmail)
      .eq("verb_display", "completed")
      .ilike("object_id", `%/courses/${courseId}/lessons/%`);

    if (countError) {
      console.error("Failed to query completed lessons count:", countError);
    }

    // Extract unique lesson IDs
    const uniqueLessons = new Set((completions || []).map(c => c.object_id));
    const completedCount = uniqueLessons.size;

    // 4. Calculate progress
    const calculatedProgress = Math.min(100, Math.round((completedCount / totalLessons) * 100));
    const isCompleted = calculatedProgress === 100;

    const upsertData: Record<string, any> = {
      email: normalizedEmail,
      course_id: courseId,
      course_title: courseTitle,
      progress: calculatedProgress,
    };

    if (isCompleted) {
      upsertData.status = "completed";
      upsertData.completed_at = new Date().toISOString();
    } else {
      upsertData.status = "active";
    }

    // 5. Update enrollment in database
    const { error: enrollError } = await supabase
      .from("enrollments")
      .upsert(upsertData, { onConflict: "email,course_id" });

    if (enrollError) {
      console.error("Enrollment update error:", enrollError);
      return NextResponse.json(
        { success: false, message: "فشل تحديث التقدم في قاعدة البيانات", error: enrollError.message },
        { status: 500, headers: CORS }
      );
    }

    // 6. Generate course-level progressed/completed statement
    try {
      const xapiParams = {
        email: normalizedEmail,
        name,
        nationalId,
        courseId,
        courseName: courseTitle,
        courseNameAr: courseTitle,
      };

      const courseStatement = isCompleted
        ? stmtCompleted(xapiParams)
        : stmtProgressed({ ...xapiParams, progress: calculatedProgress });

      await storeStatement(courseStatement);
    } catch (xapiErr) {
      console.error("Non-fatal: failed to store course progress statement:", xapiErr);
    }

    return NextResponse.json(
      {
        success: true,
        progress: calculatedProgress,
        status: isCompleted ? "completed" : "active",
        completedCount,
        totalLessons,
      },
      { headers: CORS }
    );
  } catch (err: any) {
    console.error("Complete lesson route error:", err);
    return NextResponse.json(
      { success: false, message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}
