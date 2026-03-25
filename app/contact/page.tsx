"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { Phone, Mail, MapPin, Send, CheckCircle, MessageCircle } from "lucide-react";

const contactInfo = [
  { icon: Phone, label: "الهاتف", value: "+966 54 910 5986", dir: "ltr" as const },
  { icon: Mail, label: "البريد الإلكتروني", value: "info@sustainpulse.sa", dir: "ltr" as const },
  { icon: MapPin, label: "الموقع", value: "المملكة العربية السعودية", dir: "rtl" as const },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `الاسم: ${form.name}%0Aالبريد: ${form.email}%0Aالهاتف: ${form.phone}%0Aالموضوع: ${form.subject}%0Aالرسالة: ${form.message}`;
    window.open(`https://wa.me/966549105986?text=${text}`, "_blank");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const update = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  return (
    <div className="min-h-screen pt-28 pb-20 bg-slate-50">
      {/* Hero */}
      <section className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgwLDAsMCwwLjA0KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center py-16 pb-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[#173A7C] text-sm font-bold tracking-wide uppercase bg-[#173A7C]/5 px-4 py-1.5 rounded-full inline-block mb-4">
              الدعم الفني
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-6 leading-tight">
              تواصل <span className="gradient-text">معنا</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">نسعد بتواصلك معنا. أرسل لنا رسالتك وسنرد عليك في أقرب وقت.</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 -mt-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {contactInfo.map((c, i) => {
              const Icon = c.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 flex items-center gap-5 hover:shadow-md transition-shadow"
                >
                  <div className="w-14 h-14 rounded-[20px] bg-[#173A7C]/5 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#173A7C]" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-400 block mb-1">{c.label}</span>
                    <span className="text-base text-slate-900 font-bold" dir={c.dir}>{c.value}</span>
                  </div>
                </motion.div>
              );
            })}

            {/* WhatsApp */}
            <a
              href="https://wa.me/966549105986"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 shadow-sm rounded-[24px] p-6 flex items-center gap-5 group cursor-pointer block hover:border-green-500/50 hover:shadow-md hover:shadow-green-500/10 transition-all"
            >
              <div className="w-14 h-14 rounded-[20px] bg-green-50 flex items-center justify-center shrink-0 transition-colors">
                <MessageCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <span className="text-sm font-bold text-slate-400 block mb-1">واتساب</span>
                <span className="text-base text-slate-900 font-bold group-hover:text-green-600 transition-colors">
                  تحدث معنا مباشرة
                </span>
              </div>
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200 shadow-xl shadow-slate-200/50 rounded-[32px] p-8 sm:p-12 space-y-6">
              <h2 className="text-2xl font-black text-slate-900 mb-8 w-full border-b border-slate-100 pb-4">أرسل لنا رسالة</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">الاسم الكامل</label>
                  <input
                    type="text" required value={form.name} onChange={(e) => update("name", e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                    placeholder="أدخل اسمك"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">البريد الإلكتروني</label>
                  <input
                    type="email" required value={form.email} onChange={(e) => update("email", e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                    placeholder="example@email.com" dir="ltr"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">رقم الجوال</label>
                  <input
                    type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                    placeholder="+966" dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-2">الموضوع</label>
                  <input
                    type="text" required value={form.subject} onChange={(e) => update("subject", e.target.value)}
                    className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base"
                    placeholder="موضوع رسالتك"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">الرسالة</label>
                <textarea
                  rows={5} required value={form.message} onChange={(e) => update("message", e.target.value)}
                  className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-1 focus:ring-[#173A7C] focus:bg-white outline-none transition-all text-base resize-none"
                  placeholder="اكتب رسالتك هنا..."
                />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto mt-4 px-10 shadow-lg shadow-[#173A7C]/10">
                {submitted ? (
                  <><CheckCircle className="w-5 h-5" /> تم الإرسال!</>
                ) : (
                  <><Send className="w-5 h-5 rtl:rotate-180" /> إرسال الرسالة</>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
