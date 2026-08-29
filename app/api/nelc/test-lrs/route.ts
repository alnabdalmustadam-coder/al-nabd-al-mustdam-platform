import { NextResponse } from "next/server";
import {
  stmtRegistered,
  sendToNelcLRS,
} from "@/lib/xapi";
import { requireAdmin } from "@/lib/security/auth";

/**
 * GET /api/nelc/test-lrs
 *
 * Test endpoint to verify NELC LRS connectivity
 * Sends a sample "registered" statement to the NELC staging LRS
 *
 * ⚠️ For testing only — remove or protect before production
 */
export async function GET(req: Request) {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;
    // Build a test statement
    const testStatement = stmtRegistered({
      email: "test@nabdtraining.com",
      name: "طالب تجريبي",
      nationalId: "1234567890",
      courseId: "course-haceb",
      courseName: "استخدام الحاسب الآلي في الأعمال المكتبية",
      courseNameAr: "استخدام الحاسب الآلي في الأعمال المكتبية",
    });

    console.log("🧪 NELC LRS Test — Sending statement:", JSON.stringify(testStatement, null, 2));

    // Send to NELC LRS
    const nelcResult = await sendToNelcLRS(testStatement);

    // Check configuration
    const config = {
      endpoint: process.env.NELC_LRS_ENDPOINT ? "✅ Set" : "❌ Missing",
      username: process.env.NELC_LRS_USERNAME ? "✅ Set" : "❌ Missing",
      password: process.env.NELC_LRS_PASSWORD ? "✅ Set" : "❌ Missing",
    };

    return NextResponse.json({
      test: "NELC LRS Connection Test",
      config,
      nelcResult,
      statement: testStatement,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        test: "NELC LRS Connection Test",
        error: err.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
