import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/ghl/sync-contact?email=xxx
 *
 * Fetches contact data from GHL by email and syncs it to Supabase profiles.
 * This fills the gap when the student returns from GHL with only an email.
 *
 * Returns: { synced: true, profile: { full_name, phone, ghl_contact_id } }
 */
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "البريد الإلكتروني مطلوب" }, { status: 400 });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Search for contact in GHL by email
    const searchRes = await fetch(
      `https://services.leadconnectorhq.com/contacts/?locationId=${process.env.GHL_LOCATION_ID}&query=${normalizedEmail}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          Version: "2021-07-28",
          Accept: "application/json",
        },
      }
    );

    if (!searchRes.ok) {
      console.error("GHL search failed:", searchRes.status);
      return NextResponse.json({ synced: false, message: "GHL API error" }, { status: 502 });
    }

    const searchData = await searchRes.json();
    const contact = searchData.contacts?.[0];

    if (!contact) {
      return NextResponse.json({ synced: false, message: "لم يتم العثور على جهة اتصال في GHL" });
    }

    // 2. Extract data from GHL contact
    const fullName = contact.contactName || contact.name ||
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim() || null;
    const phone = contact.phone || null;
    const ghlContactId = contact.id || null;

    // 3. Upsert into Supabase profiles (only fill empty fields, don't overwrite existing data)
    // First check existing profile
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const profileUpdate: Record<string, any> = {
      email: normalizedEmail,
      updated_at: new Date().toISOString(),
    };

    // Only fill fields that are currently empty
    if (!existingProfile?.full_name && fullName) profileUpdate.full_name = fullName;
    if (!existingProfile?.phone && phone) profileUpdate.phone = phone;
    if (!existingProfile?.ghl_contact_id && ghlContactId) profileUpdate.ghl_contact_id = ghlContactId;

    const { error } = await supabase.from("profiles").upsert(profileUpdate, { onConflict: "email" });

    if (error) {
      console.error("Supabase sync error:", error);
      return NextResponse.json({ synced: false, message: "Database error" }, { status: 500 });
    }

    // 4. Fetch the updated profile to return
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    console.log(`GHL Sync: ${normalizedEmail} → name: ${fullName || "—"}, phone: ${phone || "—"}`);

    return NextResponse.json({
      synced: true,
      profile: updatedProfile,
      ghlContact: {
        id: ghlContactId,
        name: fullName,
        phone,
      },
    });
  } catch (err: any) {
    console.error("GHL sync error:", err);
    return NextResponse.json({ synced: false, message: "Server error" }, { status: 500 });
  }
}
