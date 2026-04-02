import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, ...payload } = data;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    let subject = "";
    let htmlEmail = "";

    if (type === "placement-test") {
      const {
        student_name, student_email, student_phone, student_id,
        student_specialization, student_section,
        score, total, percentage, level, levelAr,
        correct_count, total_questions,
        writing_answer, detailed_answers
      } = payload;

      const levelColor =
        percentage >= 90 ? "#10b981" :
        percentage >= 75 ? "#3b82f6" :
        percentage >= 55 ? "#6366f1" :
        percentage >= 35 ? "#f59e0b" : "#ef4444";

      const answersHTML = detailed_answers.map((a: any) => `
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

      subject = `📋 Placement Test: ${student_name} — ${percentage}% (${level})`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="ltr">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f1f5f9; font-family: sans-serif;">
        <div style="max-width: 680px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C 0%, #5CB07C 100%); border-radius: 24px 24px 0 0; padding: 40px 32px; text-align: center;">
            <h1 style="color: white; font-size: 28px; margin: 0;">📋 Placement Test Results</h1>
          </div>
          <div style="background: white; padding: 32px; border-radius: 0 0 24px 24px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 56px; font-weight: 900; color: ${levelColor};">${percentage}%</div>
              <div style="font-size: 18px; font-weight: 800; color: #334155;">${level} (${levelAr})</div>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr><td style="color: #94a3b8; padding: 8px 0;">Student</td><td style="font-weight: 700;">${student_name}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Phone</td><td>${student_phone}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Score</td><td>${score}/${total}</td></tr>
            </table>
            <div style="background: #f8fafc; padding: 20px; border-radius: 16px; margin-bottom: 24px;">
              <strong>Writing:</strong><br>${writing_answer || "N/A"}
            </div>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #e2e8f0;">
              <tr style="background: #f8fafc;"><th style="padding:10px;">#</th><th style="text-align:left;padding:10px;">Question</th><th>Student</th><th>Correct</th></tr>
              ${answersHTML}
            </table>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "complaint") {
      const { name, email, phone, subject: msgSubject, message } = payload;
      subject = `📨 New Message: ${msgSubject} — from ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: #173A7C; border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 24px; margin: 0;">شكوى / مقترح جديد</h1>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px 0; color: #64748b; width: 120px;">الاسم:</td><td style="padding: 10px 0; font-weight: 700;">${name}</td></tr>
              <tr><td style="padding: 10px 0; color: #64748b;">الجوال:</td><td style="padding: 10px 0; font-weight: 700; text-align: left;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px 0; color: #64748b;">البريد:</td><td style="padding: 10px 0; font-weight: 700; text-align: left;" dir="ltr">${email}</td></tr>
              <tr><td style="padding: 10px 0; color: #64748b;">الموضوع:</td><td style="padding: 10px 0; font-weight: 700;">${msgSubject}</td></tr>
            </table>
            <div style="background: #f1f5f9; padding: 25px; border-radius: 15px; border-right: 4px solid #173A7C; color: #334155; line-height: 1.8;">
              ${message}
            </div>
            <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
              تم الإرسال عبر نموذج التواصل في منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "satisfaction") {
      const {
        name, phone, employer, jobTitle,
        trainerIdea, trainerSkills, trainerActivities, trainerMotivation, trainerNotes,
        centerRegistration, centerFriendliness, centerResponse, centerOrganization,
        hotelHospitality, hotelLighting, hotelAC, hotelAV, hotelCleanliness,
        notes, source
      } = payload;

      const renderRating = (val: string) => {
        let color = '#94a3b8';
        if (val === 'عالي') color = '#10b981';
        if (val === 'متوسط') color = '#f59e0b';
        if (val === 'منخفض') color = '#ef4444';
        return `<span style="display:inline-block; padding: 4px 12px; background: ${color}20; color: ${color}; border-radius: 8px; font-weight: bold; font-size: 14px;">${val || 'لم يحدد'}</span>`;
      };

      subject = `⭐ قياس رضاء المتدرب: ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #2E5EA6); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">قياس رضاء المتدرب</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الشخصية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">اسم المتدرب:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">رقم الجوال:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">جهة العمل:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${employer || "غير محدد"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الوظيفة:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${jobTitle || "غير محدد"}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم البرنامج التدريبي والأداء التدريبي (المدرب)</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">القدرة على إيصال الأفكار وربطها بالواقع العملي والاجتماعي</td><td style="padding: 12px; text-align: left;">${renderRating(trainerIdea)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">مدى ما اكتسبته من مهارات ومعلومات جديدة</td><td style="padding: 12px; text-align: left;">${renderRating(trainerSkills)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">تنوع التمارين والأنشطة التطبيقية</td><td style="padding: 12px; text-align: left;">${renderRating(trainerActivities)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">قدرة المدرب على تحفيز المشاركين وتفاعلهم</td><td style="padding: 12px; text-align: left;">${renderRating(trainerMotivation)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">مدى رضاك عن مذكرة البرنامج التدريبي</td><td style="padding: 12px; text-align: left;">${renderRating(trainerNotes)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم فريق الإشراف والاستقبال (المركز)</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">سرعة التسجيل واجراءات الدخول</td><td style="padding: 12px; text-align: left;">${renderRating(centerRegistration)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">التعامل الودود والبشاشة</td><td style="padding: 12px; text-align: left;">${renderRating(centerFriendliness)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">سرعة التجاوب للتساؤلات</td><td style="padding: 12px; text-align: left;">${renderRating(centerResponse)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">مستوى التنظيم بشكل عام</td><td style="padding: 12px; text-align: left;">${renderRating(centerOrganization)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم مستوى القاعة والخدمات (الفندق)</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">مستوى الضيافة (كوفي بريك)</td><td style="padding: 12px; text-align: left;">${renderRating(hotelHospitality)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">الإضاءة المريحة في قاعة التدريب</td><td style="padding: 12px; text-align: left;">${renderRating(hotelLighting)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">كفاءة التكييف</td><td style="padding: 12px; text-align: left;">${renderRating(hotelAC)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">وضوح وكفاءة البرجكتور والشاشات والسمعيات</td><td style="padding: 12px; text-align: left;">${renderRating(hotelAV)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">مستوى النظافة بشكل عام</td><td style="padding: 12px; text-align: left;">${renderRating(hotelCleanliness)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">الملاحظات والجهة الإعلانية</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-right: 4px solid #f59e0b;">
              <strong style="color: #64748b; display: block; margin-bottom: 8px;">ملاحظات واقتراحات:</strong>
              <div style="color: #334155;">${notes || "لا يوجد"}</div>
            </div>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-right: 4px solid #3b82f6;">
              <strong style="color: #64748b; display: block; margin-bottom: 8px;">كيف تعرفت على الدورة؟</strong>
              <div style="color: #334155; font-weight: bold;">${source || "لم يحدد"}</div>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من صفحة قياس رضاء المتدرب | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "evaluation-online") {
      const {
        name, phone, employer, jobTitle, email, courseName,
        trainerIdea, trainerSkills, trainerNotes, trainerMotivation, trainerMaterials,
        centerRegistration, centerTreatment, centerResponse,
        appInteractive, appUsability, appClarity,
        notes, futureCourses, source, nominees
      } = payload;

      const renderRating = (val: string) => {
        let color = '#94a3b8';
        if (val === 'عالي') color = '#10b981';
        if (val === 'متوسط') color = '#f59e0b';
        if (val === 'منخفض') color = '#ef4444';
        return `<span style="display:inline-block; padding: 4px 12px; background: ${color}20; color: ${color}; border-radius: 8px; font-weight: bold; font-size: 14px;">${val || 'لم يحدد'}</span>`;
      };

      subject = `🎓 تقييم دورة أون لاين: ${name} - ${courseName}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #2E5EA6); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">استمارة تقييم دورة أون لاين</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الشخصية والدورة</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">الاسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجوال:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الدورة:</td><td style="padding: 10px; font-weight: bold; background: #fef3c7; border-radius: 8px;">${courseName}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">البريد الإلكتروني:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${email || "غير محدد"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجهة / الوظيفة:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${employer || "-"} / ${jobTitle || "-"}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم البرنامج والمدرب</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">القدرة على إيصال الأفكار</td><td style="padding: 12px; text-align: left;">${renderRating(trainerIdea)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">اكتساب مهارات جديدة</td><td style="padding: 12px; text-align: left;">${renderRating(trainerSkills)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">مدى الرضا عن المذكرة</td><td style="padding: 12px; text-align: left;">${renderRating(trainerNotes)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">تحفيز المشاركين</td><td style="padding: 12px; text-align: left;">${renderRating(trainerMotivation)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">الوسائط والمعينات المرفقة</td><td style="padding: 12px; text-align: left;">${renderRating(trainerMaterials)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم المركز والخدمات</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">التسجيل وإجراءات الدخول</td><td style="padding: 12px; text-align: left;">${renderRating(centerRegistration)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">التعامل الراقي من المشرفين</td><td style="padding: 12px; text-align: left;">${renderRating(centerTreatment)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">سرعة التجاوب للتساؤلات</td><td style="padding: 12px; text-align: left;">${renderRating(centerResponse)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم التطبيق / القاعة الإلكترونية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">التطبيق تفاعلي ومناسب</td><td style="padding: 12px; text-align: left;">${renderRating(appInteractive)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">سهولة الاستخدام</td><td style="padding: 12px; text-align: left;">${renderRating(appUsability)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">وضوح الصوت والعرض</td><td style="padding: 12px; text-align: left;">${renderRating(appClarity)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">الإضافات (الملاحظات والترشيحات)</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-right: 4px solid #f59e0b;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">ملاحظات واقتراحات:</strong>
              <div style="color: #334155;">${notes || "لا يوجد"}</div>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-right: 4px solid #3b82f6;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">دورات مستقبلية مرغوبة:</strong>
              <div style="color: #334155;">
                ${futureCourses.filter(Boolean).map((c: string) => `• ${c}`).join('<br>') || "لا يوجد"}
              </div>
            </div>

            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-right: 4px solid #10b981;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">أشخاص مرشحين للدورة:</strong>
              <table style="width: 100%; font-size: 14px;">
                ${nominees.filter((n: any) => n.name).map((n: any) => `<tr><td style="padding:4px 0">${n.name}</td><td style="padding:4px 0; text-align:left;" dir="ltr">${n.phone}</td></tr>`).join('') || "لا يوجد"}
              </table>
            </div>

            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-right: 4px solid #8b5cf6;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">مصدر المعرفة بالدورة:</strong>
              <div style="color: #334155; font-weight: bold;">${source || "لم يحدد"}</div>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من استمارة تقييم أون لاين | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "evaluation-offline") {
      const {
        name, phone, employer, jobTitle,
        trainerIdea, trainerSkills, trainerNotes, trainerMotivation, trainerExercises,
        centerRegistration, centerTreatment, centerResponse, centerOrganization,
        hallHospitality, hallLighting, hallAC, hallAV, hallCleanliness,
        notes, source
      } = payload;

      const renderRating = (val: string) => {
        let color = '#94a3b8';
        if (val === 'عالي') color = '#10b981';
        if (val === 'متوسط') color = '#f59e0b';
        if (val === 'منخفض') color = '#ef4444';
        return `<span style="display:inline-block; padding: 4px 12px; background: ${color}20; color: ${color}; border-radius: 8px; font-weight: bold; font-size: 14px;">${val || 'لم يحدد'}</span>`;
      };

      subject = `🏢 تقييم دورة تدريبية: ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #2E5EA6); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">استمارة تقييم دورة تدريبية</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الشخصية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">الاسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجوال:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجهة / الوظيفة:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${employer || "-"} / ${jobTitle || "-"}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم البرنامج والمدرب</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">القدرة على ايصال الأفكار وربطها بالواقع</td><td style="padding: 12px; text-align: left;">${renderRating(trainerIdea)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">مدى ما اكتسبته من مهارات ومعلومات جديدة</td><td style="padding: 12px; text-align: left;">${renderRating(trainerSkills)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">مدى رضاك عن مذكرة البرنامج التدريبي</td><td style="padding: 12px; text-align: left;">${renderRating(trainerNotes)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">قدرة المدرب على تحفيز المشاركين</td><td style="padding: 12px; text-align: left;">${renderRating(trainerMotivation)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">تنوع التمارين والأنشطة التطبيقية</td><td style="padding: 12px; text-align: left;">${renderRating(trainerExercises)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم فريق الإشراف والاستقبال (المركز)</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">سرعة التسجيل واجراءات الدخول</td><td style="padding: 12px; text-align: left;">${renderRating(centerRegistration)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">التعامل الودود والبشاشة</td><td style="padding: 12px; text-align: left;">${renderRating(centerTreatment)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">سرعة التجاوب للتساؤلات</td><td style="padding: 12px; text-align: left;">${renderRating(centerResponse)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">مستوى التنظيم بشكل عام</td><td style="padding: 12px; text-align: left;">${renderRating(centerOrganization)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">تقييم مستوى القاعة والخدمات (الفندق)</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">مستوى الضيافة (كوفي بريك)</td><td style="padding: 12px; text-align: left;">${renderRating(hallHospitality)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">الإضاءة المريحة في قاعة التدريب</td><td style="padding: 12px; text-align: left;">${renderRating(hallLighting)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">كفاءة التكييف</td><td style="padding: 12px; text-align: left;">${renderRating(hallAC)}</td></tr>
              <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 12px; color: #475569;">وضوح وكفاءة البرجكتور والشاشات والسمعيات</td><td style="padding: 12px; text-align: left;">${renderRating(hallAV)}</td></tr>
              <tr><td style="padding: 12px; color: #475569;">مستوى النظافة بشكل عام</td><td style="padding: 12px; text-align: left;">${renderRating(hallCleanliness)}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">ملاحظات أخرى</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-right: 4px solid #f59e0b;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">ملاحظات واقتراحات:</strong>
              <div style="color: #334155;">${notes || "لا يوجد"}</div>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; border-right: 4px solid #8b5cf6;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">كيف تعرفت على الدورة؟</strong>
              <div style="color: #334155; font-weight: bold;">${source || "لم يحدد"}</div>
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من استمارة تقييم الدورة | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "career-consulting") {
      const {
        name, phone, jobTitle, employer, department, trainerName, courseName, ambition, requiredSkills, requiredCourses
      } = payload;

      subject = `🎯 استشارة تطوير وظيفي: ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #5CB07C); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">استمارة استشارة التطوير الوظيفي</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الشخصية والمهنية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">الاسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجوال:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجهة:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${employer || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">القسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${department || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">المسمى الوظيفي:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${jobTitle || "-"}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">بيانات التدريب</h2>
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 15px; border-right: 4px solid #3b82f6;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px; color: #64748b; width: 140px; font-weight: bold;">اسم المدرب:</td><td style="padding: 5px; font-weight: bold; color: #334155;">${trainerName || "-"}</td></tr>
                <tr><td style="padding: 5px; color: #64748b; font-weight: bold;">الدورة المراد تقييمها:</td><td style="padding: 5px; font-weight: bold; color: #334155;">${courseName || "-"}</td></tr>
              </table>
            </div>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">التطوير الوظيفي (الطموح والرؤية)</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px; border-right: 4px solid #10b981;">
              <strong style="color: #64748b; display: block; margin-bottom: 8px;">الهدف أو الوظيفة المأمولة:</strong>
              <div style="color: #334155; font-size: 15px; line-height: 1.6;">${ambition || "لم يكتب شيئاً"}</div>
            </div>

            <h3 style="color: #475569; font-size: 16px; margin-bottom: 10px;">المهارات اللازمة للوصول للهدف:</h3>
            <ul style="color: #334155; font-weight: bold; padding-right: 20px; margin-bottom: 20px;">
              ${requiredSkills && requiredSkills.filter(Boolean).length > 0 ? requiredSkills.filter(Boolean).map((s:string) => `<li style="margin-bottom: 5px;">${s}</li>`).join('') : '<li>لا يوجد</li>'}
            </ul>

            <h3 style="color: #475569; font-size: 16px; margin-bottom: 10px;">الدورات المناسبة لاكتساب هذه المهارات:</h3>
            <ul style="color: #334155; font-weight: bold; padding-right: 20px;">
              ${requiredCourses && requiredCourses.filter(Boolean).length > 0 ? requiredCourses.filter(Boolean).map((s:string) => `<li style="margin-bottom: 5px;">${s}</li>`).join('') : '<li>لا يوجد</li>'}
            </ul>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من نموذج الاستشارات والتطوير الوظيفي | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "skills-applications") {
      const {
        name, phone, jobTitle, employer, department, trainerName, courseName, keyIdeas, appliedSkills, managerOpinion
      } = payload;

      subject = `📋 استمارة تطبيقات ومهارات: ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #5CB07C); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">استمارة مهارات وتطبيقات البرنامج</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الأساسية للبرنامج</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">الاسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجوال:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجهة / القسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${employer || "-"} / ${department || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">المسمى الوظيفي:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${jobTitle || "-"}</td></tr>
            </table>

            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 30px; border-right: 4px solid #3b82f6;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px; color: #64748b; width: 140px; font-weight: bold;">اسم الدورة:</td><td style="padding: 5px; font-weight: bold; color: #334155;">${courseName || "-"}</td></tr>
                <tr><td style="padding: 5px; color: #64748b; font-weight: bold;">اسم المدرب:</td><td style="padding: 5px; font-weight: bold; color: #334155;">${trainerName || "-"}</td></tr>
              </table>
            </div>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">التطبيقات والأفكار</h2>
            
            <strong style="color: #64748b; display: block; margin-bottom: 8px; margin-top: 20px;">أبرز وأهم الأفكار في البرنامج:</strong>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; color: #334155; font-size: 15px; line-height: 1.6;">
              ${keyIdeas || "لم يكتب شيئاً"}
            </div>

            <h3 style="color: #475569; font-size: 16px; margin-top: 30px; margin-bottom: 10px;">أهم التطبيقات والمهارات التي سيتم تطبيقها:</h3>
            <ul style="color: #334155; font-weight: bold; padding-right: 20px; margin-bottom: 30px;">
              ${appliedSkills && appliedSkills.filter(Boolean).length > 0 ? appliedSkills.filter(Boolean).map((s:string) => `<li style="margin-bottom: 5px;">${s}</li>`).join('') : '<li>لا يوجد</li>'}
            </ul>

            <strong style="color: #64748b; display: block; margin-bottom: 8px;">رأي الرئيس المباشر / المستفيد:</strong>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; color: #334155; font-size: 15px; line-height: 1.6;">
              ${managerOpinion || "لم يكتب شيئاً"}
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من نموذج استمارة بناء المهارات | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "courses-survey") {
      const {
        name, city, phone, participationPreference, suggestedCourses, suggestedTrainers
      } = payload;

      subject = `📊 استطلاع رأي إقامة الدورات: ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #5CB07C); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">استطلاع رأي عن إقامة الدورات</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الشخصية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">الاسم:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">المدينة:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${city || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">رقم التواصل واتس:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">التفضيلات والاقتراحات</h2>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 12px; margin-bottom: 20px; border-right: 4px solid #3b82f6;">
              <strong style="color: #64748b; display: block; margin-bottom: 5px;">الرغبة في المشاركة:</strong>
              <div style="color: #1e293b; font-weight: bold;">${participationPreference || "لم يتم التحديد"}</div>
            </div>

            <strong style="color: #64748b; display: block; margin-bottom: 8px; margin-top: 20px;">الدورات المقترحة:</strong>
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; color: #334155; border: 1px solid #e2e8f0;">
              ${suggestedCourses || "لا يوجد مقترحات"}
            </div>

            <strong style="color: #64748b; display: block; margin-bottom: 8px; margin-top: 20px;">المدربين المقترحين:</strong>
            <div style="background: #f8fafc; padding: 15px; border-radius: 10px; color: #334155; border: 1px solid #e2e8f0;">
              ${suggestedTrainers || "لا يوجد مقترحات"}
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من نموذج استطلاع الرأي | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "membership") {
      const {
        name, phone, email, qualification, jobTitle, employer, marketerName, aspirations, interests, notes, membershipCategory
      } = payload;

      const tierLabels = {
        silver: "الفضية (شركاء التميز)",
        gold: "الذهبية (شركاء الأصالة)",
        platinum: "البلاتينية (شركاء الإبداع)"
      };

      subject = `🎖️ طلب انضمام لعضوية: ${name}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #2E5EA6); border-radius: 20px 20px 0 0; padding: 40px; text-align: center;">
            <div style="background: white; width: 80px; height: 80px; border-radius: 20px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
              <img src="https://tti.edu.sa/logo.png" style="width: 50px; height: auto;">
            </div>
            <h1 style="color: white; font-size: 28px; margin: 0;">طلب انضمام لعضوية الشراكة</h1>
            <p style="color: rgba(255,255,255,0.8); margin-top: 10px; font-size: 16px;">فئة: ${tierLabels[membershipCategory as keyof typeof tierLabels] || membershipCategory}</p>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">البيانات الشخصية والمهنية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 12px; color: #64748b; width: 160px; font-weight: bold;">الاسم بالكامل:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${name}</td></tr>
              <tr><td style="padding: 12px; color: #64748b; font-weight: bold;">رقم الجوال:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 12px; color: #64748b; font-weight: bold;">البريد الإلكتروني:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${email}</td></tr>
              <tr><td style="padding: 12px; color: #64748b; font-weight: bold;">المؤهل:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${qualification || "-"}</td></tr>
              <tr><td style="padding: 12px; color: #64748b; font-weight: bold;">المسمى الوظيفي:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${jobTitle || "-"}</td></tr>
              <tr><td style="padding: 12px; color: #64748b; font-weight: bold;">جهة العمل:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${employer || "-"}</td></tr>
              <tr><td style="padding: 12px; color: #64748b; font-weight: bold;">اسم المسوق:</td><td style="padding: 12px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${marketerName || "-"}</td></tr>
            </table>

            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">التطلعات والاهتمامات</h2>
            
            <strong style="color: #64748b; display: block; margin-bottom: 8px; margin-top: 20px;">الطموح الوظيفي (3 سنوات):</strong>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; color: #334155; font-size: 15px; border: 1px solid #e2e8f0; line-height: 1.6;">
              ${aspirations || "لم يذكر"}
            </div>

            <strong style="color: #64748b; display: block; margin-bottom: 8px; margin-top: 20px;">مجالات اهتمام أخرى:</strong>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; color: #334155; font-size: 15px; border: 1px solid #e2e8f0; line-height: 1.6;">
              ${interests || "لم يذكر"}
            </div>

            <strong style="color: #64748b; display: block; margin-bottom: 8px; margin-top: 20px;">ملاحظات:</strong>
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; color: #334155; font-size: 15px; border: 1px solid #e2e8f0; line-height: 1.6;">
              ${notes || "لا يوجد ملاحظات"}
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من نموذج طلب العضوية | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    } else if (type === "subscription") {
      const {
        firstName, secondName, thirdName, surname, nationality, idNumber, phone, qualification, email
      } = payload;

      const fullName = `${firstName} ${secondName} ${thirdName} ${surname}`;

      subject = `📨 اشتراك جديد في الموقع: ${fullName}`;
      htmlEmail = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: sans-serif; text-align: right;">
        <div style="max-width: 700px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(135deg, #173A7C, #5CB07C); border-radius: 20px 20px 0 0; padding: 30px; text-align: center;">
            <h1 style="color: white; font-size: 26px; margin: 0;">بيانات المشترك الجديد (لإصدار الشهادات)</h1>
          </div>
          <div style="background: white; padding: 40px; border-radius: 0 0 20px 20px; border: 1px solid #e2e8f0;">
            
            <h2 style="color: #173A7C; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px; margin-top: 0;">المعلومات الشخصية</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr><td style="padding: 10px; color: #64748b; width: 140px; font-weight: bold;">الاسم الرباعي:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${fullName}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">الجنسية:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${nationality || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">رقم الهوية:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${idNumber || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">رقم الجوال:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px; text-align: right;" dir="ltr">${phone}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">المؤهل الدراسي:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${qualification || "-"}</td></tr>
              <tr><td style="padding: 10px; color: #64748b; font-weight: bold;">البريد الإلكتروني:</td><td style="padding: 10px; font-weight: bold; background: #f8fafc; border-radius: 8px;">${email}</td></tr>
            </table>

            <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border: 1px solid #fed7aa; color: #9a3412; font-size: 14px; line-height: 1.6;">
              <strong>إقرار المتدرب:</strong> أقر بأن جميع البيانات أعلاه صحيحة وعلى مسؤوليتي الشخصية لأغراض إصدار الشهادات المعتمدة.
            </div>

            <div style="margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px;">
              تم الإرسال من نموذج الاشتراك بالموقع | منصة النبض المستدام
            </div>
          </div>
        </div>
      </body>
      </html>`;
    }

    await transporter.sendMail({
      from: `"Sustain Pulse Platform" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: subject,
      html: htmlEmail,
    });

    // Submitting to LeadConnector (GoHighLevel) Form "O8dD5KvfiHWPaB3zpuzM"
    try {
      if (type === "complaint" || type === "satisfaction" || type === "evaluation-online" || type === "evaluation-offline" || type === "career-consulting" || type === "skills-applications" || type === "courses-survey" || type === "membership" || type === "subscription") {
        const { name, email, phone } = payload;
        const ghlBody = new FormData();
        ghlBody.set(
          "formData",
          JSON.stringify({
            formId: "O8dD5KvfiHWPaB3zpuzM",
            name: name || "",
            email: email || "no-reply@sustainpulse.sa",
            phone: phone || "",
          })
        );

        await fetch("https://backend.leadconnectorhq.com/forms/submit", {
          method: "POST",
          body: ghlBody,
          headers: {
            "Accept": "application/json",
          },
        });
      }
    } catch (ghlErr) {
      console.error("GHL Submission Error:", ghlErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
