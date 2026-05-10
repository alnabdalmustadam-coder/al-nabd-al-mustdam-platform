import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GHL Webhook — يستقبل بيانات الطالب من GoHighLevel عند إنشاء contact جديد
 * ويحفظ الـ National ID في Supabase لمتطلبات NELC
 *
 * Webhook URL: https://your-domain.com/api/webhooks/ghl
 * Event: contact.create / contact.update
 */

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
    const payload = await req.json();

    // GHL webhook payload structure
    // Standard fields: email, firstName, lastName, phone, name, id
    // Custom fields come in customFields array or as customData
    const email = payload.email || payload.contact?.email || null;
    const fullName =
      payload.name ||
      payload.contact?.name ||
      `${payload.firstName || payload.contact?.firstName || ""} ${payload.lastName || payload.contact?.lastName || ""}`.trim();
    const phone =
      payload.phone || payload.contact?.phone || null;
    const ghlContactId =
      payload.id || payload.contact?.id || payload.contactId || null;

    // Extract National ID from custom fields
    // GHL custom fields can come in different formats
    let nationalId: string | null = null;

    // Format 1: customFields array
    if (Array.isArray(payload.customFields)) {
      const nidField = payload.customFields.find(
        (f: any) =>
          f.key === "national_id" ||
          f.key === "nationalId" ||
          f.key === "national_id_number" ||
          f.key === "الهوية_الوطنية" ||
          (f.fieldKey && f.fieldKey.includes("national"))
      );
      if (nidField) nationalId = nidField.value || nidField.field_value || null;
    }

    // Format 2: customData object
    if (!nationalId && payload.customData) {
      nationalId =
        payload.customData.national_id ||
        payload.customData.nationalId ||
        payload.customData.national_id_number ||
        null;
    }

    // Format 3: contact.customFields
    if (!nationalId && payload.contact?.customFields) {
      const cf = payload.contact.customFields;
      if (Array.isArray(cf)) {
        const nidField = cf.find(
          (f: any) =>
            f.key === "national_id" ||
            f.key === "nationalId" ||
            (f.fieldKey && f.fieldKey.includes("national"))
        );
        if (nidField) nationalId = nidField.value || null;
      } else if (typeof cf === "object") {
        nationalId = cf.national_id || cf.nationalId || null;
      }
    }

    // Format 4: top-level field
    if (!nationalId) {
      nationalId = payload.national_id || payload.nationalId || null;
    }

    if (!email) {
      console.warn("GHL Webhook: No email found in payload", JSON.stringify(payload).slice(0, 500));
      return NextResponse.json(
        { success: false, message: "No email in payload" },
        { status: 200, headers: CORS }
      );
    }

    // Upsert profile in Supabase
    const { error } = await supabase.from("profiles").upsert(
      {
        email,
        full_name: fullName || null,
        phone: phone || null,
        national_id: nationalId || null,
        ghl_contact_id: ghlContactId,
        nelc_eligible: !!nationalId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("Supabase upsert error:", error);
      return NextResponse.json(
        { success: false, message: "Database error" },
        { status: 200, headers: CORS }
      );
    }

    console.log(
      `GHL Webhook: Profile saved — ${email}, NID: ${nationalId ? "✓" : "✗"}`
    );

    return NextResponse.json({ success: true }, { headers: CORS });
  } catch (err: any) {
    console.error("GHL Webhook Error:", err);
    // Always return 200 to GHL so it doesn't retry
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 200, headers: CORS }
    );
  }
}
