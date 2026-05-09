import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  const { fullName, email, phone, password, nationalId } = await req.json();

  if (nationalId && !/^[124]\d{9}$/.test(nationalId)) {
    return NextResponse.json(
      { message: "رقم وطني غير صحيح" },
      { status: 400, headers: corsHeaders }
    );
  }

  const GHL_KEY = process.env.GHL_API_KEY;
  const NID_FIELD = process.env.GHL_NATIONAL_ID_FIELD_ID;

  try {
    // الخطوة 1: أنشئ أو حدّث الـ Contact في GHL
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "-";

    const contactBody: any = {
      firstName,
      lastName,
      email,
      phone,
    };

    if (nationalId && NID_FIELD) {
      contactBody.customField = [{ id: NID_FIELD, value: nationalId }];
      contactBody.tags = ["nelc-eligible"];
    }

    const contactRes = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GHL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactBody),
    });

    const contactData = await contactRes.json();
    console.log("GHL Contact Response:", JSON.stringify(contactData));

    if (!contactRes.ok) {
      return NextResponse.json(
        { message: contactData.message || "فشل إنشاء الحساب في GHL" },
        { status: 400, headers: corsHeaders }
      );
    }

    const contactId = contactData.contact?.id;

    // الخطوة 2: منح الـ Client Portal Access بكلمة المرور
    if (contactId && password) {
      const portalRes = await fetch(
        `https://rest.gohighlevel.com/v1/contacts/${contactId}/business`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GHL_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );
      console.log("Portal Access Status:", portalRes.status);
    }

    // الخطوة 3: إيميل ترحيب
    try {
      const nodemailer = require("nodemailer");
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
            <p>تم إنشاء حسابك بنجاح في منصة نبض المستدام للتدريب.</p>
            ${nationalId ? `<p>✅ رقمك الوطني مسجل — أنت مؤهل لشهادات NELC المعتمدة.</p>` : ""}
            <p>بريدك: <strong>${email}</strong></p>
            <a href="https://members.nabdtraining.com"
               style="background:#0e6e4a;color:#fff;padding:12px 28px;border-radius:8px;
                      text-decoration:none;display:inline-block;margin-top:16px;font-weight:bold">
              الدخول للمنصة
            </a>
          </div>
        `,
      });
    } catch (mailErr) {
      console.error("Email error (non-fatal):", mailErr);
      // الإيميل مش شرط للنجاح
    }

    return NextResponse.json(
      { success: true, redirectUrl: "https://members.nabdtraining.com" },
      { headers: corsHeaders }
    );

  } catch (err: any) {
    console.error("Register error:", err);
    return NextResponse.json(
      { message: "حدث خطأ في الخادم" },
      { status: 500, headers: corsHeaders }
    );
  }
}
