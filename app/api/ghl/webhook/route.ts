import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Must use service_role to bypass RLS

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // The payload from GHL webhook can vary depending on what triggered it.
    // Usually, it contains 'email' and 'contact_id' or 'id'.
    // Let's support both common formats.
    const email = payload.email || (payload.contact && payload.contact.email);
    const contactId = payload.contact_id || payload.id || (payload.contact && payload.contact.id);

    if (!email || !contactId) {
      return NextResponse.json(
        { success: false, message: "Missing email or contact_id in webhook payload" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Update the profile in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({ ghl_contact_id: contactId })
      .eq("email", cleanEmail);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update profile", error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Contact ID updated successfully" });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: err.message },
      { status: 500 }
    );
  }
}
