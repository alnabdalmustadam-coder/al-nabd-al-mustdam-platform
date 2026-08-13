import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (e) {
    console.error("Supabase signOut error:", e);
  }

  const response = NextResponse.json({ success: true, redirectUrl: "/auth/login" });

  response.cookies.delete("nabd_session_email");
  response.cookies.delete("nabd_session_name");

  return response;
}

export async function GET() {
  return POST();
}
