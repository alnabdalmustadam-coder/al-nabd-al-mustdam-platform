import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { requireUser, getDashboardUrlForRole, getRoleDisplayName, normalizeRole } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const user = auth.user;

    // Fetch full name and role from profiles using admin client
    let { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, avatar_url, role")
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

    const effectiveRole = profile?.role ? normalizeRole(profile.role) : auth.role;
    const dashboardUrl = getDashboardUrlForRole(effectiveRole);
    const roleLabel = getRoleDisplayName(effectiveRole);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.user_metadata?.full_name || "",
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
        role: effectiveRole,
        dashboardUrl,
        roleLabel,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
