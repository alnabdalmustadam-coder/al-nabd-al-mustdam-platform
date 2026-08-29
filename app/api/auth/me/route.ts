import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { requireUser } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const user = auth.user;

    // Fetch full name from profiles using admin client
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile && user.email) {
      // Fallback: look up by email
      const { data: profileByEmail } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("email", user.email.toLowerCase().trim())
        .maybeSingle();

      if (profileByEmail) {
        profile = profileByEmail;
        
        // Link the profile to the current user's ID
        await supabaseAdmin
          .from("profiles")
          .update({ id: user.id })
          .eq("email", user.email.toLowerCase().trim());
      } else {
        // Create new profile row for this user
        const { data: newProfile, error: insertError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email.toLowerCase().trim(),
            full_name: user.user_metadata?.full_name || "",
            role: "STUDENT",
            nelc_eligible: false
          })
          .select()
          .maybeSingle();

        if (!insertError && newProfile) {
          profile = newProfile;
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: profile?.full_name || user.user_metadata?.full_name || "",
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
