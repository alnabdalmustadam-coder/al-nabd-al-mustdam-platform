"use client";
import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        window.location.href =
          "https://register.nabdtraining.com/register-page?error=auth_failed";
        return;
      }

      // جيب Magic Link من الـ server
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: data.session.user.id }),
      });

      const result = await res.json();
      window.location.href =
        result.redirectUrl || "https://members.nabdtraining.com";
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
        direction: "rtl",
      }}
    >
      <p>جاري تسجيل الدخول...</p>
    </div>
  );
}
