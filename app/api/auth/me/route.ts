import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const email = req.cookies.get("nabd_session_email")?.value;
  const name = req.cookies.get("nabd_session_name")?.value;

  if (!email) {
    return NextResponse.json({ success: false, message: "No session found" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      email,
      name: name || "",
    },
  });
}
