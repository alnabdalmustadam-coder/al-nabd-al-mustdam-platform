"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowUpLeft,
  CheckCircle2,
  Clock3,
  Headphones,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from "lucide-react";
import { SITE_CONTACT } from "@/data/siteContact";

type ContactForm = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

const INITIAL_FORM: ContactForm = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const contactChannels = [
  {
    icon: Phone,
    label: "الهاتف",
    value: SITE_CONTACT.phoneInternational,
    href: SITE_CONTACT.phoneHref,
    hint: "اتصال مباشر",
  },
  {
    icon: Mail,
    label: "البريد العام",
    value: SITE_CONTACT.primaryEmail,
    href: `mailto:${SITE_CONTACT.primaryEmail}`,
    hint: "للاستفسارات والتسجيل",
  },
  {
    icon: Headphones,
    label: "الدعم الفني",
    value: SITE_CONTACT.supportEmail,
    href: `mailto:${SITE_CONTACT.supportEmail}`,
    hint: "للمساعدة التقنية",
  },
];

function isValidSaudiPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return /^(?:9665|05|5)\d{8}$/.test(digits);
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>(INITIAL_FORM);
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const update = (key: keyof ContactForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (!isValidSaudiPhone(form.phone)) {
      setFeedback({ type: "error", message: "يرجى إدخال رقم جوال سعودي صحيح، مثل رقم عرض." });
      return;
    }

    if (!agreed) {
      setFeedback({ type: "error", message: "يلزم الموافقة على سياسة الخصوصية قبل الإرسال." });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contact", ...form }),
      });
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error || "تعذر إرسال الرسالة في الوقت الحالي.");
      }

      setForm(INITIAL_FORM);
      setAgreed(false);
      setFeedback({
        type: "success",
        message: "تم استلام رسالتك بنجاح. سيتواصل معك فريقنا في أقرب وقت.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#F8FAFC_0%,#FFFFFF_46%,#EEF4F9_100%)] pb-24 pt-24 font-[family-name:var(--font-cairo)]" dir="rtl">
      <div className="pointer-events-none absolute -right-48 top-24 h-[520px] w-[520px] rounded-full bg-[#0B3766]/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -left-48 bottom-0 h-[500px] w-[500px] rounded-full bg-[#19B6C7]/[0.09] blur-[120px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #0B3766 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-16 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="section-badge-glass mb-5">
            <MessageCircle className="h-4 w-4 text-[#19B6C7]" />
            نحن بالقرب منك
          </span>
          <h1 className="section-main-title-premium mb-5 text-3xl sm:text-4xl lg:text-5xl">
            تواصل معنا <span className="gradient-text">بكل سهولة</span>
          </h1>
          <p className="section-desc-premium mx-auto max-w-2xl">
            سواء كان لديك استفسار عن دورة، أو تحتاج إلى دعم فني، فريق مَدار للتعلّم جاهز لمساعدتك عبر القناة الأنسب لك.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#19B6C7]/30 bg-white/85 px-4 py-2 shadow-sm text-[#0B3766]">
              <CheckCircle2 className="h-4 w-4 text-[#19B6C7]" />
              بيانات تواصل موحدة ومعتمدة
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-4 py-2 shadow-sm text-[#0B3766]">
              <ShieldCheck className="h-4 w-4 text-[#0B3766]" />
              رسالتك محفوظة بخصوصية
            </span>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch lg:gap-8">
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65 }}
            className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#072244_0%,#0B3766_55%,#168AD3_100%)] p-6 text-white shadow-[0_30px_75px_-35px_rgba(11,55,102,0.12)] sm:p-8 lg:h-full"
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-[#19B6C7]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative z-10">
              <span className="text-xs font-bold text-[#19B6C7]">قنوات التواصل الرسمية</span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">اختر الطريقة الأنسب لك</h2>
              <p className="mt-3 text-sm font-semibold leading-7 text-blue-100/85">
                جميع البيانات هنا مطابقة للبيانات الرسمية المعروضة في فوتر المنصة.
              </p>

              <div className="mt-8 space-y-3">
                {contactChannels.map((channel) => {
                  const Icon = channel.icon;
                  return (
                    <a
                      key={channel.label}
                      href={channel.href}
                      className="group flex items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-4 backdrop-blur-md transition-all hover:border-[#19B6C7]/60 hover:bg-white/[0.14]"
                    >
                      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-[#19B6C7] transition-transform group-hover:-rotate-3 group-hover:scale-105">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-bold text-blue-100/70">{channel.label} · {channel.hint}</span>
                        <span className="mt-1 block break-all text-sm font-bold text-white" dir="ltr">{channel.value}</span>
                      </span>
                      <ArrowUpLeft className="h-4 w-4 shrink-0 text-white/35 transition-all group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#19B6C7]" />
                    </a>
                  );
                })}

                <a
                  href={SITE_CONTACT.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-[#19B6C7]/30 bg-[#19B6C7]/10 p-4 transition-all hover:border-[#19B6C7]/60 hover:bg-[#19B6C7]/20"
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#19B6C7] text-white shadow-lg shadow-[#0B3766]/20">
                      <MessageCircle className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">تحدث معنا عبر واتساب</span>
                      <span className="text-[11px] font-bold text-blue-100/80">محادثة مباشرة على الرقم الرسمي</span>
                    </span>
                  </span>
                  <ArrowUpLeft className="h-4 w-4 text-[#19B6C7]" />
                </a>
              </div>

              <div className="mt-7 space-y-3 border-t border-white/10 pt-6 text-xs font-semibold leading-6 text-blue-100/85">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#19B6C7]" />
                  <span>{SITE_CONTACT.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="mt-1 h-4 w-4 shrink-0 text-[#19B6C7]" />
                  <span>{SITE_CONTACT.workingHours}</span>
                </div>
              </div>
            </div>
          </motion.aside>

          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="h-full rounded-[2rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_28px_70px_-42px_rgba(11,55,102,0.12)] backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="mb-8 flex items-start gap-4 border-b border-slate-100 pb-6">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#0B3766] to-[#2b5aad] text-white shadow-lg shadow-[#0B3766]/15">
                <Send className="h-5 w-5 rtl:rotate-180" />
              </span>
              <div>
                <span className="text-[11px] font-bold text-[#168AD3]">نموذج التواصل السريع</span>
                <h2 className="mt-1 text-xl font-bold text-[#0B3766] sm:text-2xl">أرسل رسالتك إلى فريقنا</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">املأ البيانات التالية وسنعود إليك عبر البريد أو الجوال.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="mb-2 block text-xs font-bold text-slate-700">الاسم الكامل</label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={(event) => update("name", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B3766] focus:bg-white focus:ring-4 focus:ring-[#0B3766]/[0.06]"
                    placeholder="اكتب اسمك الكامل"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-xs font-bold text-slate-700">البريد الإلكتروني</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={180}
                    value={form.email}
                    onChange={(event) => update("email", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-left text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B3766] focus:bg-white focus:ring-4 focus:ring-[#0B3766]/[0.06]"
                    placeholder="name@example.com"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-phone" className="mb-2 block text-xs font-bold text-slate-700">رقم الجوال</label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    maxLength={18}
                    value={form.phone}
                    onChange={(event) => update("phone", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-left text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B3766] focus:bg-white focus:ring-4 focus:ring-[#0B3766]/[0.06]"
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-2 block text-xs font-bold text-slate-700">موضوع الرسالة</label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    value={form.subject}
                    onChange={(event) => update("subject", event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none transition-all focus:border-[#0B3766] focus:bg-white focus:ring-4 focus:ring-[#0B3766]/[0.06]"
                  >
                    <option value="" disabled>اختر نوع الاستفسار</option>
                    <option value="استفسار عن دورة تدريبية">استفسار عن دورة تدريبية</option>
                    <option value="الدعم الفني للمنصة">الدعم الفني للمنصة</option>
                    <option value="التسجيل والشهادات">التسجيل والشهادات</option>
                    <option value="تدريب الشركات">تدريب الشركات</option>
                    <option value="استفسار عام">استفسار عام</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="contact-message" className="text-xs font-bold text-slate-700">تفاصيل الرسالة</label>
                  <span className="text-[10px] font-bold text-slate-400">{form.message.length} / 2000</span>
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  required
                  minLength={10}
                  maxLength={2000}
                  value={form.message}
                  onChange={(event) => update("message", event.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-bold leading-7 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0B3766] focus:bg-white focus:ring-4 focus:ring-[#0B3766]/[0.06]"
                  placeholder="اشرح لنا كيف يمكننا مساعدتك..."
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/65 p-3.5">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0B3766]"
                />
                <span className="text-xs font-semibold leading-6 text-slate-600">
                  أوافق على معالجة بياناتي وفقًا لـ{" "}
                  <Link href="/privacy" className="font-bold text-[#0B3766] underline decoration-[#0B3766]/25 underline-offset-4">سياسة الخصوصية</Link>
                  {" "}و
                  <Link href="/terms" className="font-bold text-[#0B3766] underline decoration-[#0B3766]/25 underline-offset-4">الشروط والأحكام</Link>.
                </span>
              </label>

              {feedback && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`flex items-start gap-3 rounded-xl border p-4 text-xs font-bold leading-6 ${
                    feedback.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <span>{feedback.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-[#0B3766] to-[#2454A0] px-8 py-4 text-sm font-bold text-white shadow-lg shadow-[#0B3766]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري إرسال الرسالة...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 rtl:rotate-180" />
                    إرسال الرسالة
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
