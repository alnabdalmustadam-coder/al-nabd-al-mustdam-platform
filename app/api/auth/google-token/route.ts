import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { access_token } = await req.json();

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(access_token);

    if (error || !user) {
      return NextResponse.json({
        error: "invalid_user",
      });
    }

    const email = user.email || "";

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      email.split("@")[0];

    // تحقق من profile
    const { data: existing } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!existing) {
      await supabase.from("profiles").insert({
        id: user.id,
        full_name: fullName,
        phone: "",
        nelc_eligible: false,
      });
    }

    return NextResponse.json({
      success: true,
      redirectUrl: "/dashboard/student",
    });
  } catch (e) {
    console.error(e);

    return NextResponse.json({
      error: "server_error",
    });
  }
}
