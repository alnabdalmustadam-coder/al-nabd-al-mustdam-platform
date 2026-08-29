import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/utils/supabase/server";

const REGISTER_PAGE = "https://register.nabdtraining.com/register-page";

async function handleUser(userId: string, email: string, fullName: string) {
  // تحقق لو موجود في profiles
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("ghl_contact_id")
    .eq("id", userId)
    .single();

  let ghlContactId = profile?.ghl_contact_id;

  // لو مش موجود → أنشئ profile + GHL Contact
  if (!ghlContactId) {
    const nameParts = (fullName || email.split("@")[0]).split(" ");
    try {
      const ghlRes = await fetch(
        "https://services.leadconnectorhq.com/contacts/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
          },
          body: JSON.stringify({
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" ") || "-",
            email,
            locationId: process.env.GHL_LOCATION_ID,
            tags: ["google-auth", "website-registered"],
          }),
        }
      );
      const ghlData = await ghlRes.json();
      ghlContactId = ghlData?.contact?.id || null;
    } catch (e) {
      console.error("GHL error:", e);
    }

    await supabaseAdmin.from("profiles").upsert({
      id: userId,
      full_name: fullName || email.split("@")[0],
      phone: "",
      ghl_contact_id: ghlContactId,
      nelc_eligible: false,
    });
  }

  // اطلب Magic Link
  let redirectUrl = "https://members.nabdtraining.com";
  if (ghlContactId) {
    try {
      const magicRes = await fetch(
        "https://services.leadconnectorhq.com/client-portal/magic-links",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.GHL_API_KEY}`,
            "Content-Type": "application/json",
            Version: "2021-07-28",
          },
          body: JSON.stringify({
            contactId: ghlContactId,
            locationId: process.env.GHL_LOCATION_ID,
          }),
        }
      );
      const magicData = await magicRes.json();
      if (magicData?.link) redirectUrl = magicData.link;
    } catch (e) {
      console.error("Magic link error:", e);
    }
  }

  return redirectUrl;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  try {
    if (code) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error || !data.user) {
        return NextResponse.redirect(`${REGISTER_PAGE}?error=auth_failed`);
      }
      const name = data.user.user_metadata?.full_name || data.user.user_metadata?.name || "";
      const redirectUrl = await handleUser(data.user.id, data.user.email!, name);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.redirect(`${REGISTER_PAGE}?error=no_code`);

  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect(`${REGISTER_PAGE}?error=server_error`);
  }
}
