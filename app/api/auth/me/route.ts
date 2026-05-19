import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

    // Fetch full name from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

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
