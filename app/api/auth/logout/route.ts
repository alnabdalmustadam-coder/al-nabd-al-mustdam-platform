import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { DEMO_COOKIE } from "@/lib/demo/fixtures";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Supabase signOut error:", e);
  }

  const response = NextResponse.json({ success: true, redirectUrl: "/auth/login" });

  response.cookies.delete(DEMO_COOKIE);
  response.cookies.delete("madar_demo_session_email");
  response.cookies.delete("madar_demo_session_name");

  return response;
}
