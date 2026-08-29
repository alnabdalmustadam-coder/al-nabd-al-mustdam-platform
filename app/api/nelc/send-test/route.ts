import { NextRequest, NextResponse } from "next/server";
import {
  sendToNelcLRS,
  stmtRegistered,
  stmtLaunched,
  stmtProgressed,
  stmtCompleted,
  stmtPassed,
  stmtAttended,
} from "@/lib/xapi";
import { requireAdmin } from "@/lib/security/auth";

/**
 * POST /api/nelc/send-test
 *
 * Send a complete learning journey to NELC LRS for accreditation testing.
 * This sends the full lifecycle: registered → launched → progressed → completed → passed
 *
 * Body: {
 *   "email": "student@example.com",
 *   "name": "اسم الطالب",
 *   "nationalId": "2280434909",
 *   "courseId": "course-haceb",
 *   "courseName": "استخدام الحاسب الآلي في الأعمال المكتبية"
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    const body = await req.json();

    const email = body.email || "test@nabdtraining.com";
    const name = body.name || "طالب تجريبي";
    const nationalId = body.nationalId || "";
    const courseId = body.courseId || "course-haceb";
    const courseName = body.courseName || "استخدام الحاسب الآلي في الأعمال المكتبية";

    if (!nationalId) {
      return NextResponse.json(
        { error: "nationalId مطلوب — رقم الهوية الوطنية" },
        { status: 400 }
      );
    }

    const commonParams = {
      email,
      name,
      nationalId,
      courseId,
      courseName,
      courseNameAr: courseName,
    };

    const results: { step: string; success: boolean; error?: string; statusCode?: number }[] = [];

    // ── Step 1: Registered (سجّل في الدورة) ──
    const stmt1 = stmtRegistered(commonParams);
    const r1 = await sendToNelcLRS(stmt1);
    results.push({ step: "1. registered (سجّل)", ...r1 });

    // Small delay between statements
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 2: Launched (بدأ الدورة) ──
    const stmt2 = stmtLaunched(commonParams);
    const r2 = await sendToNelcLRS(stmt2);
    results.push({ step: "2. launched (بدأ)", ...r2 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 3: Progressed 25% ──
    const stmt3 = stmtProgressed({ ...commonParams, progress: 25 });
    const r3 = await sendToNelcLRS(stmt3);
    results.push({ step: "3. progressed 25%", ...r3 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 4: Progressed 50% ──
    const stmt4 = stmtProgressed({ ...commonParams, progress: 50 });
    const r4 = await sendToNelcLRS(stmt4);
    results.push({ step: "4. progressed 50%", ...r4 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 5: Progressed 75% ──
    const stmt5 = stmtProgressed({ ...commonParams, progress: 75 });
    const r5 = await sendToNelcLRS(stmt5);
    results.push({ step: "5. progressed 75%", ...r5 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 6: Progressed 100% ──
    const stmt6 = stmtProgressed({ ...commonParams, progress: 100 });
    const r6 = await sendToNelcLRS(stmt6);
    results.push({ step: "6. progressed 100%", ...r6 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 7: Completed (أكمل الدورة) ──
    const stmt7 = stmtCompleted({ ...commonParams, duration: "PT40H" });
    const r7 = await sendToNelcLRS(stmt7);
    results.push({ step: "7. completed (أكمل)", ...r7 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 8: Passed (اجتاز) ──
    const stmt8 = stmtPassed({ ...commonParams, score: 85 });
    const r8 = await sendToNelcLRS(stmt8);
    results.push({ step: "8. passed (اجتاز) 85%", ...r8 });

    await new Promise((resolve) => setTimeout(resolve, 500));

    // ── Step 9: Attended (حضر) ──
    const stmt9 = stmtAttended({ ...commonParams, duration: "PT40H" });
    const r9 = await sendToNelcLRS(stmt9);
    results.push({ step: "9. attended (حضر)", ...r9 });

    // ── Summary ──
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      message: `NELC Test Complete: ${successCount}/${results.length} statements sent successfully`,
      learner: { email, name, nationalId },
      course: { courseId, courseName },
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount,
      },
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("❌ NELC Test Error:", err);
    return NextResponse.json(
      { error: err.message, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
