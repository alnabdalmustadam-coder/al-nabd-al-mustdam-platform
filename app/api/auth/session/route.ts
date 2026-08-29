import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/security/auth";

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (!auth.ok) return auth.response;

    const { data: profile } = await auth.supabase
      .from('profiles')
      .select('full_name')
      .eq('id', auth.user.id)
      .maybeSingle();
    const email = auth.user.email || '';
    const name = profile?.full_name || auth.user.user_metadata?.full_name || '';

    const response = NextResponse.json({ success: true });

    // Set HTTP-Only cookies
    response.cookies.set("nabd_session_email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });

    if (name) {
      response.cookies.set("nabd_session_name", encodeURIComponent(name), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
