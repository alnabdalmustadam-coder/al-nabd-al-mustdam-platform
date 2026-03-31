import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const {
      student_name, student_email, student_phone, student_id,
      student_specialization, student_section,
      score, total, percentage, level, levelAr,
      correct_count, total_questions,
      writing_answer, detailed_answers
    } = data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const levelColor =
      percentage >= 90 ? "#10b981" :
      percentage >= 75 ? "#3b82f6" :
      percentage >= 55 ? "#6366f1" :
      percentage >= 35 ? "#f59e0b" : "#ef4444";

    const answersHTML = detailed_answers.map((a: { id: number; question: string; student: string; correct: string; isCorrect: boolean }) => `
      <tr style="border-bottom: 1px solid #f1f5f9;">
        <td style="padding: 12px 16px; font-weight: 700; color: #64748b; text-align: center; width: 50px;">${a.id}</td>
        <td style="padding: 12px 16px; color: #334155; font-size: 14px;">${a.question}</td>
        <td style="padding: 12px 16px; text-align: center;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; ${a.isCorrect ? 'background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;' : 'background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; text-decoration: line-through;'}">${a.student}</span>
        </td>
        <td style="padding: 12px 16px; text-align: center;">
          <span style="display: inline-block; padding: 4px 12px; border-radius: 8px; font-size: 13px; font-weight: 700; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0;">${a.correct}</span>
        </td>
      </tr>
    `).join("");

    const htmlEmail = `
    <!DOCTYPE html>
    <html dir="ltr">
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #173A7C 0%, #2F66D6 50%, #5CB07C 100%); border-radius: 24px 24px 0 0; padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 28px; font-weight: 900; margin: 0 0 8px;">📋 Placement Test Results</h1>
          <p style="color: rgba(255,255,255,0.7); font-size: 15px; margin: 0;">Sustain Pulse Institute — معهد النبض المستدام</p>
        </div>

        <!-- Score Card -->
        <div style="background: white; padding: 0 32px 32px; border-radius: 0 0 24px 24px; box-shadow: 0 20px 40px rgba(23,58,124,0.08);">
          
          <!-- Score Banner -->
          <div style="background: ${levelColor}12; border: 2px solid ${levelColor}30; border-radius: 20px; padding: 28px; margin: -20px 0 28px; text-align: center; position: relative; top: -10px;">
            <div style="font-size: 56px; font-weight: 900; color: ${levelColor}; line-height: 1;">${percentage}%</div>
            <div style="font-size: 18px; font-weight: 800; color: #334155; margin-top: 8px;">${level}</div>
            <div style="font-size: 14px; color: #64748b; font-weight: 600; margin-top: 4px;">${levelAr}</div>
            <div style="display: flex; justify-content: center; gap: 32px; margin-top: 16px;">
              <div><span style="font-size: 24px; font-weight: 900; color: #334155;">${score}</span><span style="color: #94a3b8; font-size: 14px;">/${total}</span><br><span style="font-size: 11px; color: #94a3b8; font-weight: 700;">SCORE</span></div>
              <div style="width: 1px; background: #e2e8f0;"></div>
              <div><span style="font-size: 24px; font-weight: 900; color: #334155;">${correct_count}</span><span style="color: #94a3b8; font-size: 14px;">/${total_questions}</span><br><span style="font-size: 11px; color: #94a3b8; font-weight: 700;">CORRECT</span></div>
            </div>
          </div>

          <!-- Student Info -->
          <h2 style="font-size: 16px; font-weight: 800; color: #173A7C; margin: 0 0 16px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">👤 Student Information</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 700; width: 140px;">Name</td>
              <td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 600;">${student_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 700;">Phone</td>
              <td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 600;">${student_phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 700;">ID Number</td>
              <td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 600;">${student_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 700;">Email</td>
              <td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 600;">${student_email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 700;">Specialization</td>
              <td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 600;">${student_specialization}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; font-weight: 700;">Section</td>
              <td style="padding: 8px 0; color: #334155; font-size: 14px; font-weight: 600;">${student_section}</td>
            </tr>
          </table>

          <!-- Writing Section -->
          <h2 style="font-size: 16px; font-weight: 800; color: #173A7C; margin: 0 0 12px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">✍️ Writing Section</h2>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 28px; color: #475569; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${writing_answer || "N/A"}</div>

          <!-- Detailed Answers -->
          <h2 style="font-size: 16px; font-weight: 800; color: #173A7C; margin: 0 0 12px; padding-bottom: 10px; border-bottom: 2px solid #f1f5f9;">📝 Detailed Answers</h2>
          <table style="width: 100%; border-collapse: collapse; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
            <thead>
              <tr style="background: #f8fafc;">
                <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-align: center;">#</th>
                <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-align: left;">Question</th>
                <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-align: center;">Student</th>
                <th style="padding: 12px 16px; font-size: 12px; font-weight: 700; color: #94a3b8; text-align: center;">Correct</th>
              </tr>
            </thead>
            <tbody>${answersHTML}</tbody>
          </table>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px 0; color: #94a3b8; font-size: 12px; font-weight: 600;">
          © ${new Date().getFullYear()} Sustain Pulse Institute — Auto-generated report
        </div>
      </div>
    </body>
    </html>`;

    await transporter.sendMail({
      from: `"Sustain Pulse Institute" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: student_email,
      subject: `📋 Placement Test: ${student_name} — ${percentage}% (${level})`,
      html: htmlEmail,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
