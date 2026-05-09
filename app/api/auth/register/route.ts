import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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
    const body = await req.json();
    const { fullName, email, phone, password, nationalId } = body;

    // Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { message: "جميع الحقول مطلوبة" },
        { status: 400, headers: CORS }
      );
    }

    if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
      return NextResponse.json(
        { message: "رقم وطني غير صحيح" },
        { status: 400, headers: CORS }
      );
    }

    const GHL_KEY = process.env.GHL_API_KEY;

    if (!GHL_KEY) {
      console.error("GHL_API_KEY is not set");
      return NextResponse.json(
        { message: "خطأ في إعداد الخادم - GHL Key مفقود" },
        { status: 500, headers: CORS }
      );
    }

    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    // إنشاء Contact في GHL - API v2
    const contactBody: Record<string, any> = {
      firstName,
      lastName,
      email,
      phone,
      locationId: process.env.GHL_LOCATION_ID,
    };

    const NID_FIELD = process.env.GHL_NATIONAL_ID_FIELD_ID;
    if (nationalId && NID_FIELD) {
      // API v2 format for custom fields
      contactBody.customFields = [{ id: NID_FIELD, value: nationalId }];
      contactBody.tags = ["nelc-eligible"];
    }

    console.log("Creating GHL contact:", JSON.stringify({ firstName, email }));

    // ✅ API v2 endpoint
    const contactRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_KEY}`,
        "Content-Type": "application/json",
        "Version": "2021-07-28",
      },
      body: JSON.stringify(contactBody),
    });

    const contactData = await contactRes.json();
    console.log("GHL Response status:", contactRes.status);
    console.log("GHL Response body:", JSON.stringify(contactData));

    if (!contactRes.ok) {
      return NextResponse.json(
        { message: contactData?.message || "فشل إنشاء الحساب" },
        { status: 400, headers: CORS }
      );
    }

    const contactId = contactData?.contact?.id;

    // منح portal access
    if (contactId) {
      try {
        const portalRes = await fetch(
          `https://services.leadconnectorhq.com/contacts/${contactId}/memberships`,
          {
            method: "POST", 
            headers: {
              Authorization: `Bearer ${GHL_KEY}`,
              "Content-Type": "application/json",
              "Version": "2021-07-28",
            },
            body: JSON.stringify({
              locationId: process.env.GHL_LOCATION_ID,
              email: email,
              password: password,
            }),
          }
        );
        console.log("Portal Access Status:", portalRes.status);
      } catch (portalErr) {
        console.error("Portal access error:", portalErr);
      }
    }

    // إيميل ترحيب (اختياري - لو فشل مش مشكلة)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: `"منصة نبض المستدام" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "مرحباً بك في منصة نبض المستدام 🎓",
        html: `
          <div dir="rtl" style="font-family:Arial;max-width:600px;margin:0 auto;padding:24px">
            <h2 style="color:#0e6e4a">أهلاً ${fullName}!</h2>
            <p>تم إنشاء حسابك بنجاح.</p>
            ${nationalId ? `<p>✅ رقمك الوطني مسجل — مؤهل لشهادات NELC.</p>` : ""}
            <a href="https://members.nabdtraining.com"
               style="background:#0e6e4a;color:#fff;padding:12px 28px;border-radius:8px;
                      text-decoration:none;display:inline-block;margin-top:16px">
              الدخول للمنصة
            </a>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Email failed (non-fatal):", mailErr);
    }

    return NextResponse.json(
      { success: true, redirectUrl: "https://members.nabdtraining.com" },
      { headers: CORS }
    );

  } catch (err: any) {
    console.error("Unexpected error:", err?.message || err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم" },
      { status: 500, headers: CORS }
    );
  }
}