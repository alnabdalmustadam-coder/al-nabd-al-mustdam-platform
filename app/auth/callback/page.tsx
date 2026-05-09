"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleAuth() {
      try {
        // يقرأ access_token من URL تلقائياً
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          window.location.href =
            "https://register.nabdtraining.com/register-page?error=no_session";
          return;
        }

        // أرسل بيانات المستخدم للسيرفر
        const res = await fetch("/api/auth/google-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: session.user.id,
            email: session.user.email,
            fullName:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              "",
          }),
        });

        const data = await res.json();

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          window.location.href = "https://members.nabdtraining.com";
        }
      } catch (err) {
        console.error(err);
        window.location.href =
          "https://register.nabdtraining.com/register-page?error=server_error";
      }
    }

    handleAuth();
  }, []);

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "sans-serif",
        direction: "rtl",
      }}
    >
      جاري تسجيل الدخول...
    </div>
  );
}
