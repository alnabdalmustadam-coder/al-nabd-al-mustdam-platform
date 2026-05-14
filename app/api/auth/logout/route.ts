import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.delete("nabd_session_email");
  response.cookies.delete("nabd_session_name");

  return response;
}
