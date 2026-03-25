"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Mail } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="py-28 relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-[#173A7C]/5">
      {/* Mail Icon Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <Mail className="w-[400px] h-[400px] text-[#173A7C] opacity-[0.01]" strokeWidth={0.5} />
      </div>

      {/* Noise */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <span className="inline-flex items-center gap-2 text-[#173A7C] text-sm font-black tracking-widest uppercase bg-white px-5 py-2 rounded-full mb-6 border border-slate-200 shadow-sm">
            <Mail className="w-4 h-4 text-[#5CB07C]" />
            النشرة البريدية
          </span>

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#173A7C] mt-2 leading-[1.2] tracking-tight mb-4">
            ابقَ على اطلاع بأحدث{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">الدورات</span>
          </h2>

          <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium leading-relaxed mb-12">
            اشترك في النشرة البريدية واحصل على عروض حصرية وأحدث الدورات مباشرة في بريدك الإلكتروني.
          </p>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-3 max-w-2xl mx-auto p-2.5 bg-white/80 backdrop-blur-2xl rounded-full border border-slate-200 ring-1 ring-inset ring-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
          >
            <div className="relative flex-1 w-full">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full px-6 py-4 rounded-full bg-transparent border-none text-[#173A7C] font-bold placeholder:text-slate-400 placeholder:font-medium focus:outline-none text-base"
                dir="rtl"
                required
              />
            </div>
            <button
              type="submit"
              className="btn-ripple px-10 py-4 rounded-full bg-gradient-to-r from-[#173A7C] to-[#1a4490] text-white font-bold text-base shadow-xl shadow-[#173A7C]/15 hover:shadow-2xl hover:shadow-[#173A7C]/25 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer w-full sm:w-auto min-w-[180px]"
            >
              {submitted ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  تم الاشتراك!
                </>
              ) : (
                <>
                  اشترك الآن
                  <Send className="w-5 h-5 rtl:rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Trust line */}
          <p className="mt-6 text-slate-400 text-sm font-medium flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-[#5CB07C]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            بياناتك في أمان تام • لا نرسل رسائل مزعجة
          </p>
        </motion.div>
      </div>
    </section>
  );
}
