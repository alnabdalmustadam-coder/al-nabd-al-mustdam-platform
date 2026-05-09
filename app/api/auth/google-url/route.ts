import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: CORS });
}

export async function GET() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://nabdtraining.com/api/auth/google",
    },
  });

  if (error || !data.url) {
    return NextResponse.json({ error: "فشل" }, { status: 500, headers: CORS });
  }

  return NextResponse.json({ url: data.url }, { headers: CORS });
}
