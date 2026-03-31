"use client";

import { motion } from "framer-motion";
import { MessageSquarePlus, Send, MessageCircle, Phone, Mail, MapPin, CheckCircle2, Clock, Headset } from "lucide-react";
import React, { useState } from "react";

export default function ComplaintsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 pt-[calc(10vh+5rem)] font-sans" dir="rtl">
      
      {/* ═══════════════════════════════════════ HEADER ═══════════════════════════════════════ */}
      <section className="relative px-4 sm:px-6 mb-16 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm mb-8 hover:shadow-md transition-shadow">
            <MessageSquarePlus className="w-4 h-4 text-[#173A7C]" />
            <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">صوتك مسموع ويهمنا</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black text-slate-900 mb-6 leading-[1.35] tracking-tight">
            رفع الشكاوى <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C] inline-block mt-3">والمقترحات التطويرية</span>
          </h1>
          
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-[1.8] max-w-3xl mx-auto mb-10">
            نسعد ونرحب دائماً باستقبال اقتراحاتكم البنّاءة لسماع آرائكم، كما نلتزم بمعالجة أي شكاوى قد تواجهكم بكل شفافية واحترافية لضمان تقديم أفضل تجربة تدريبية ممكنة في معهد النبض المستدام.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-bold text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> سرية تامة للبيانات</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> رد خلال 24 ساعة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-[#5CB07C]" /> معالجة فورية</span>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════ CONTENT SECTION ═══════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Form Side (Span 7) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#5CB07C]/[0.03] to-transparent rounded-br-full pointer-events-none" />
            
            <div className="mb-10 relative z-10">
              <h2 className="text-2xl font-black text-slate-900 mb-3">تواصل معنا للشكاوى والاقتراحات</h2>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 text-sm font-bold">
                <Clock className="w-4 h-4" />
                <span>سيتم الرد عليكم في خلال 24 ساعة</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-bold text-slate-700 mx-1 block">الاسم الرباعي <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="name" 
                    required 
                    placeholder="اكتب اسمك هنا" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-[15px] font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all"
                  />
                </div>
                
                {/* Phone */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-bold text-slate-700 mx-1 block">رقم الجوال <span className="text-red-500">*</span></label>
                  <input 
                    type="tel" 
                    id="phone" 
                    required 
                    placeholder="اكتب رقم جوالك للتواصل" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-[15px] font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700 mx-1 block">البريد الإلكتروني <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    id="email" 
                    required 
                    placeholder="اكتب بريدك الإلكتروني" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-[15px] font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all text-right"
                    dir="ltr"
                  />
                </div>
                
                {/* Subject */}
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-bold text-slate-700 mx-1 block">عنوان الرسالة <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    id="subject" 
                    required 
                    placeholder="اكتب عنوان الرسالة" 
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-[15px] font-medium rounded-xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-bold text-slate-700 mx-1 block">محتوى الرسالة <span className="text-red-500">*</span></label>
                <textarea 
                  id="message" 
                  required 
                  rows={6}
                  placeholder="اكتب محتوى الرسالة أو الاستفسار بالتفصيل..." 
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-[15px] font-medium rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/20 focus:border-[#173A7C] transition-all resize-y"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting || isSubmitted}
                className={`w-full py-4 rounded-xl font-bold text-[16px] transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group ${
                  isSubmitted 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "bg-[#0A162B] hover:bg-[#173A7C] text-white shadow-xl shadow-[#173A7C]/20 hover:-translate-y-1"
                }`}
              >
                {isSubmitting ? (
                  <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    تم الإرسال بنجاح
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 rtl:scale-x-[-1]" />
                    إرسال الطلب
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Info Card Side (Span 5) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:col-span-5 relative"
          >
            <div className="bg-gradient-to-br from-[#0A162B] via-[#0E2242] to-[#173A7C] rounded-[2.5rem] p-10 sm:p-12 text-center shadow-[0_20px_60px_-15px_rgba(23,58,124,0.3)] h-full overflow-hidden relative flex flex-col justify-center items-center">
              
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#5CB07C]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

              <div className="relative z-10 w-full">
                <div className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-2xl mx-auto mb-8 flex items-center justify-center border border-white/10 shadow-inner">
                  <Headset className="w-10 h-10 text-white group-hover:scale-110 transition-transform" />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-4">تواصل معنا</h2>
                <p className="text-blue-100/70 font-medium text-base mb-12">
                  فريقنا متواجد دائماً للرد على استفساراتكم وملاحظاتكم بكل اهتمام.
                </p>

                <h3 className="text-sm font-bold text-white/50 tracking-wide uppercase mb-8 relative inline-flex">
                  <span className="relative z-10 px-4 bg-[#0E2242]">تابعنا على شبكات التواصل</span>
                  <span className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -translate-y-1/2" />
                </h3>

                {/* Social Icons matching the image design */}
                <div className="flex items-center justify-center gap-4">
                  {[
                    {
                      label: "Instagram",
                      href: "#",
                      svg: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                        </svg>
                      ),
                    },
                    {
                      label: "YouTube",
                      href: "#",
                      svg: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
                        </svg>
                      ),
                    },
                    {
                      label: "WhatsApp",
                      href: "https://wa.me/966549105986",
                      svg: <MessageCircle className="w-5 h-5" />,
                    },
                    {
                      label: "Twitter",
                      href: "#",
                      svg: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      ),
                    },
                    {
                      label: "Facebook",
                      href: "#",
                      svg: (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                      ),
                    },
                  ].map((social, idx) => (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#173A7C] hover:bg-[#5CB07C] hover:text-white hover:-translate-y-2 hover:shadow-lg hover:shadow-[#5CB07C]/30 transition-all duration-300"
                    >
                      {social.svg}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
      
    </div>
  );
}
