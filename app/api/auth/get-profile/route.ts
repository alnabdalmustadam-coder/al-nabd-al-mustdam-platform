import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "userId مطلوب" }, { status: 400 });
  }

  try {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json({ message: "حدث خطأ" }, { status: 500 });
  }
}
