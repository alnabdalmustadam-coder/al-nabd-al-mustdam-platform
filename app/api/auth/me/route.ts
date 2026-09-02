import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from "@/lib/supabase";
import { requireUser, getDashboardUrlForRole, getRoleDisplayName, isAdminRole, isInstructorRole } from "@/lib/security/auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;
    const user = auth.user;

    // Fetch full name, avatar, and role from profiles using admin client
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

    let effectiveRole = auth.role;
    if (!isAdminRole(effectiveRole) && !isInstructorRole(effectiveRole)) {
      if (profile?.role) {
        const dbRole = String(profile.role).toUpperCase().trim();
        if (['ADMIN', 'SUPERADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'TRAINER', 'TEACHER'].includes(dbRole)) {
          effectiveRole = dbRole as any;
        }
      }
    }

    const dashboardUrl = getDashboardUrlForRole(effectiveRole);
    const roleLabel = getRoleDisplayName(effectiveRole);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || "",
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        role: effectiveRole,
        dashboardUrl,
        roleLabel,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
