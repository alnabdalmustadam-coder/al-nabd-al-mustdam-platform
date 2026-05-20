import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.json({ success: true });

  response.cookies.delete("nabd_session_email");
  response.cookies.delete("nabd_session_name");

  return response;
}
