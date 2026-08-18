import { NextRequest, NextResponse } from 'next/server';
import {
  getAllIssuedCertificates,
  getAllTemplates,
  issueCertificate,
} from '@/lib/certificates-store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentName,
      studentEmail,
      courseTitle,
      courseSlug,
      grade,
      hours,
      templateId,
    } = body;

    if (!courseTitle && !courseSlug) {
      return NextResponse.json(
        { success: false, error: 'عنوان الدورة مطلوب لإصدار الشهادة' },
        { status: 400 }
      );
    }

    const name = studentName || 'المتدرب المتميز';
    const title = courseTitle || 'الدورة التدريبية المعتمدة';
    const email = studentEmail ? studentEmail.toLowerCase().trim() : undefined;

    const allIssued = getAllIssuedCertificates();
    const allTemplates = getAllTemplates();

    // Check if certificate already exists
    const existing = allIssued.find(
      (c) =>
        (email ? c.studentEmail?.toLowerCase().trim() === email : c.studentName === name) &&
        (c.courseTitle.toLowerCase().trim() === title.toLowerCase().trim() ||
         c.courseTitle.includes(title) ||
         title.includes(c.courseTitle))
    );

    if (existing) {
      const template = allTemplates.find((t) => t.id === existing.templateId) || allTemplates[0];
      return NextResponse.json({
        success: true,
        alreadyIssued: true,
        certificate: {
          ...existing,
          template,
        },
      });
    }

    // Determine best template
    let targetTemplateId = templateId;
    if (!targetTemplateId) {
      const matchedTpl =
        allTemplates.find(
          (t) =>
            t.courseTitle.toLowerCase().trim() === title.toLowerCase().trim() ||
            title.toLowerCase().includes(t.courseTitle.toLowerCase()) ||
            t.courseTitle.toLowerCase().includes(title.toLowerCase())
        ) ||
        allTemplates.find((t) => t.autoIssue) ||
        allTemplates[0];

      targetTemplateId = matchedTpl ? matchedTpl.id : 'tpl-1';
    }

    const matchedTemplate = allTemplates.find((t) => t.id === targetTemplateId) || allTemplates[0];

    const newCert = issueCertificate({
      studentName: name,
      studentEmail: email,
      courseTitle: title,
      templateId: targetTemplateId,
      grade: grade || 'ممتاز مرتفع (%98)',
      hours: hours || '30 ساعة تدريبية معتمدة',
      imageUrl: matchedTemplate?.imageUrl || '/1.png',
    });

    return NextResponse.json({
      success: true,
      certificate: {
        ...newCert,
        template: matchedTemplate,
      },
    });
  } catch (err: any) {
    console.error('Error in auto-issue route:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
