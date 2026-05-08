import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://register.nabdtraining.com",
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

  try {
    const ghlRes = await fetch("https://rest.gohighlevel.com/v1/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GHL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
        email,
        phone,
        password,
        customField: nationalId
          ? [{ id: process.env.GHL_NATIONAL_ID_FIELD_ID, value: nationalId }]
          : [],
        tags: nationalId ? ["nelc-eligible"] : [],
      }),
    });

    if (!ghlRes.ok) {
      const err = await ghlRes.json();
      return NextResponse.json(
        { message: err.message || "فشل إنشاء الحساب" },
        { status: 400, headers: corsHeaders }
      );
    }

    // إيميل ترحيب
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
        <div dir="rtl" style="font-family:Arial;max-width:600px;margin:0 auto">
          <h2 style="color:#0e6e4a">أهلاً ${fullName}!</h2>
          <p>تم إنشاء حسابك بنجاح في منصة نبض المستدام للتدريب.</p>
          ${nationalId ? `<p>✅ تم تسجيل رقمك الوطني — أنت مؤهل للحصول على شهادات معتمدة من NELC.</p>` : ""}
          <a href="https://members.nabdtraining.com"
             style="background:#0e6e4a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px">
            الدخول للمنصة
          </a>
        </div>
      `,
    });

    return NextResponse.json(
      { success: true, redirectUrl: "https://members.nabdtraining.com" },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "حدث خطأ" },
      { status: 500, headers: corsHeaders }
    );
  }
}
