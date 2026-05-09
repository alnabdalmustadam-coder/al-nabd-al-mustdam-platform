"use client";

import { useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  useEffect(() => {
    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href =
          "https://register.nabdtraining.com/register-page?error=no_session";
        return;
      }

      try {
        const res = await fetch("/api/auth/finalize-login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            access_token: session.access_token,
          }),
        });

        const data = await res.json();

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          window.location.href =
            "https://members.nabdtraining.com";
        }
      } catch (e) {
        console.error(e);

        window.location.href =
          "https://members.nabdtraining.com";
      }
    }

    init();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontFamily: "sans-serif",
      }}
    >
      جاري تسجيل الدخول...
    </div>
  );
}
