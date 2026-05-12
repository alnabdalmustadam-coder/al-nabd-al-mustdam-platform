import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  const userId = req.nextUrl.searchParams.get("userId");

  if (!email && !userId) {
    return NextResponse.json({ message: "email أو userId مطلوب" }, { status: 400 });
  }

  try {
    let query = supabase.from("profiles").select("*");

    if (email) {
      query = query.eq("email", email.toLowerCase().trim());
    } else if (userId) {
      query = query.eq("id", userId);
    }

    const { data: profile, error } = await query.maybeSingle();

    if (error) throw error;

    return NextResponse.json({ profile: profile || null });
  } catch (err) {
    console.error("Get profile error:", err);
    return NextResponse.json({ message: "حدث خطأ" }, { status: 500 });
  }
}
