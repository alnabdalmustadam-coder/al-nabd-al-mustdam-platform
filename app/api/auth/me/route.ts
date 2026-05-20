import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      // Fallback to legacy cookies for backward compatibility
      const email = req.cookies.get("nabd_session_email")?.value;
      const name = req.cookies.get("nabd_session_name")?.value;

      if (!email) {
        return NextResponse.json({ success: false, message: "No session found" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: {
          email,
          name: name ? decodeURIComponent(name) : "",
        },
      });
    }

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
            role: "TRAINEE",
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
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
