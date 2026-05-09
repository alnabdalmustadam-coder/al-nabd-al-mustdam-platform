import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect("https://register.nabdtraining.com/register-page?error=no_code");
  }

  try {
    // استبدل الـ code بـ session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      return NextResponse.redirect("https://register.nabdtraining.com/register-page?error=auth_failed");
    }

    const user = data.user;

    // تحقق لو موجود في profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("ghl_contact_id")
      .eq("id", user.id)
      .single();

    let ghlContactId = profile?.ghl_contact_id;

    // لو مش موجود → أنشئ Contact في GHL
    if (!ghlContactId) {
      const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "مستخدم";
      const nameParts = name.split(" ");

      const ghlRes = await fetch("https://services.leadconnectorhq.com/contacts/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GHL_API_KEY}`,
          "Content-Type": "application/json",
          Version: "2021-07-28",
        },
        body: JSON.stringify({
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" ") || "-",
          email: user.email,
          locationId: process.env.GHL_LOCATION_ID,
          tags: ["google-auth", "website-registered"],
        }),
      });

      const ghlData = await ghlRes.json();
      ghlContactId = ghlData?.contact?.id || null;

      // احفظ في profiles
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        phone: "",
        ghl_contact_id: ghlContactId,
        nelc_eligible: false,
      });
    }

    // اطلب Magic Link من GHL
    let redirectUrl = "https://members.nabdtraining.com";

    if (ghlContactId) {
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
    }

    return NextResponse.redirect(redirectUrl);

  } catch (err) {
    console.error("Google callback error:", err);
    return NextResponse.redirect("https://register.nabdtraining.com/register-page?error=server_error");
  }
}
