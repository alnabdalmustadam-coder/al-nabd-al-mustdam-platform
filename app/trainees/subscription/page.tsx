"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  Send, CheckCircle, User, Phone, Mail, GraduationCap,
  ShieldAlert, Globe, CreditCard, ChevronLeft, ChevronRight,
  Sparkles, ShieldCheck
} from "lucide-react";

interface FormState {
  firstName: string;
  secondName: string;
  thirdName: string;
  surname: string;
  nationality: string;
  idNumber: string;
  phone: string;
  qualification: string;
  email: string;
}

const initialFormState: FormState = {
  firstName: "",
  secondName: "",
  thirdName: "",
  surname: "",
  nationality: "",
  idNumber: "",
  phone: "",
  qualification: "",
  email: "",
};

const commonNationalities = [
  "المملكة العربية السعودية",
  "جمهورية مصر العربية",
  "المملكة الأردنية الهاشمية",
  "الإمارات العربية المتحدة",
  "دولة الكويت",
  "سلطنة عمان",
  "مملكة البحرين",
  "دولة قطر",
  "جمهورية السودان",
  "الجمهورية اليمنية",
  "جنسية أخرى"
];

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 rounded-[20px] bg-white border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all duration-300 text-[15px] font-medium shadow-sm hover:border-slate-300 flex items-center justify-between text-right cursor-pointer"
      >
        <span className={value ? "text-slate-900 font-bold" : "text-slate-400"}>
          {displayValue}
        </span>
        <ChevronLeft className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : "-rotate-90"}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-[1.25rem] shadow-xl shadow-slate-200/50 z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
            >
              <div className="p-2">
                {options.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    type="button"
                    onClick={() => {
                      onChange(item.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      value === item.value
                        ? "bg-[#173A7C]/5 text-[#173A7C]"
                        : "text-slate-700 hover:bg-slate-50 hover:text-[#173A7C]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SubscriptionPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alertModal, setAlertModal] = useState<{ open: boolean; type: "warning" | "error"; message: string }>({ open: false, type: "warning", message: "" });

  const showAlert = (message: string, type: "warning" | "error" = "warning") => {
    setAlertModal({ open: true, type, message });
  };

  const updateForm = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ═══ Completion progress ═══ */
  const progress = useMemo(() => {
    const filledCount = Object.values(form).filter(v => v.trim() !== "").length;
    return Math.round((filledCount / 9) * 100);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.firstName.trim() || !form.surname.trim() || !form.phone.trim() || !form.idNumber.trim()) {
      showAlert("يرجى ملء الاسم بالكامل، رقم الهوية، ورقم الجوال أولاً", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "subscription", ...form }),
      });
      if (res.ok) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showAlert("حدث خطأ أثناء الإرسال، يرجى المحاولة مرة أخرى", "error");
      }
    } catch (error) {
      console.error(error);
      showAlert("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ═══ Alert Modal Component ═══ */
  const AlertModal = () => (
    <AnimatePresence>
      {alertModal.open && (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={() => setAlertModal((p) => ({ ...p, open: false }))}
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative bg-white rounded-[2rem] p-8 sm:p-10 max-w-sm w-full shadow-[0_30px_80px_-15px_rgba(23,58,124,0.3)] border border-slate-100 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#173A7C] via-[#2E5EA6] to-[#5CB07C]" />
            <div className={`absolute top-0 right-0 w-40 h-40 rounded-bl-full pointer-events-none ${alertModal.type === "error" ? "bg-gradient-to-bl from-red-500/[0.04]" : "bg-gradient-to-bl from-amber-500/[0.04]"} to-transparent`} />
            <div className="mb-5"><img src="/logo.svg" alt="Logo" className="h-10 mx-auto object-contain" /></div>
            <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center shadow-lg ${
              alertModal.type === "error"
                ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20"
                : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20"
            }`}>
              {alertModal.type === "error" ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
              )}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">{alertModal.type === "error" ? "خطأ!" : "تنبيه!"}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-7">{alertModal.message}</p>
            <button onClick={() => setAlertModal((p) => ({ ...p, open: false }))} className="w-full py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] shadow-lg shadow-[#173A7C]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">حسناً، فهمت</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  /* ═══ Input field helper ═══ */
  const inputClass = "w-full px-5 py-4 rounded-[20px] bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all duration-300 text-[15px] font-medium shadow-sm hover:border-slate-300";

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AlertModal />
      
      {/* ═══════════ BACKGROUND ═══════════ */}
      <div className="fixed inset-0 z-0">
        <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.92] via-slate-50/[0.88] to-blue-50/[0.85]" />
      </div>

      <div className="relative z-10 pb-24 pt-28">
        
        {/* ═══════════ HERO WITH LOGO ═══════════ */}
        <section className="relative px-4 sm:px-6 mb-12 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }} className="mb-8">
            <div className="relative inline-block">
                <div className="absolute inset-0 bg-[#173A7C]/10 blur-[50px] rounded-full" />
                <img src="/logo.svg" alt="Sustain Pulse Logo" className="h-20 sm:h-28 mx-auto relative z-10 mb-6 drop-shadow-2xl" />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#173A7C]" />
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">نموذج التسجيل بالموقع</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-5 tracking-tight leading-tight">
              استمارة الاشتراك{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
                في الموقع الإلكتروني
              </span>
            </h1>

            {/* Warning Section */}
            <div className="max-w-3xl mx-auto mt-10 p-6 rounded-[2rem] bg-white/40 backdrop-blur-xl border border-white/60 shadow-xl text-right relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-red-400 to-rose-600 opacity-80" />
                <div className="flex items-start gap-4 flex-row-reverse text-right">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h4 className="text-red-700 font-black text-lg mb-2">تنبيه هام جداً</h4>
                        <div className="space-y-3 text-[14px] text-slate-600 font-bold leading-relaxed">
                            <p>• الرجاء التأكد من أن كل بياناتك مكتوبة بطريقة صحيحة، حيث أن تلك البيانات تحتاجها إدارة معهد القمة للتدريب من أجل إصدار الشهادات المعتمدة للدارسين.</p>
                            <p>• إدارة المعهد تعلن عدم مسئوليتها عن أية بيانات خاطئة من شأنها تعطيل إصدار شهادات الدورات أو إصدارها ببيانات خاطئة حيث أن ذلك يعود على المتدرب الذي لم يتأكد من إدخال بياناته بصورة صحيحة، وعليه ..</p>
                            <p>• يتحمل المتدرب كافة التكاليف الخاصة بإعادة إصدار شهادة حضور دورة معتمدة مرة أخرى.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-10 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">بيانات الشهادة</span>
                <span className="text-xs font-black text-[#5CB07C]">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ═══════════ SUCCESS STATE ═══════════ */
            <motion.section key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-2xl mx-auto px-4 sm:px-6">
              <div className="bg-white rounded-[2.5rem] p-10 sm:p-16 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.1)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#173A7C]/[0.02] to-[#5CB07C]/[0.03] pointer-events-none" />
                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative z-10">
                  <div className="w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-[#173A7C] to-[#5CB07C] flex items-center justify-center shadow-2xl shadow-[#173A7C]/25">
                    <ShieldCheck className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">تم التسجيل بنجاح!</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
                    شكراً لتسجيلك في الموقع. تم حفظ بياناتك لدى إدارة معهد القمة للتدريب لاستخدامها في إصدار شهاداتك المعتمدة.
                  </p>
                </motion.div>
              </div>
            </motion.section>
          ) : (
            /* ═══════════ FORM ═══════════ */
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-2xl relative overflow-visible text-right">
                
                {/* ─── Part 1: Full Arabic Name ─── */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-8 justify-end">
                    <h2 className="text-xl font-black text-slate-900">المعلومات الشخصية</h2>
                    <User className="w-6 h-6 text-[#173A7C]" />
                  </div>

                  <label className="block text-sm font-bold text-slate-700 mb-4">الاسم الرباعي باللغة العربية (كما يظهر في الهوية)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <input type="text" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} className={`${inputClass} text-center`} placeholder="الاسم الأول" />
                    </div>
                    <div>
                      <input type="text" value={form.secondName} onChange={(e) => updateForm("secondName", e.target.value)} className={`${inputClass} text-center`} placeholder="الاسم الثاني" />
                    </div>
                    <div>
                      <input type="text" value={form.thirdName} onChange={(e) => updateForm("thirdName", e.target.value)} className={`${inputClass} text-center`} placeholder="الاسم الثالث" />
                    </div>
                    <div>
                      <input type="text" value={form.surname} onChange={(e) => updateForm("surname", e.target.value)} className={`${inputClass} text-center`} placeholder="الكنية" />
                    </div>
                  </div>
                </div>

                {/* ─── Part 2: ID and Nationality ─── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 relative">
                  <div className="relative z-[50]">
                    <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">الجنسية <Globe className="w-4 h-4 text-[#173A7C]" /></label>
                    <CustomDropdown
                      value={form.nationality}
                      onChange={(val) => updateForm("nationality", val)}
                      placeholder="-- الرجاء اختيار الجنسية --"
                      options={commonNationalities.map(n => ({ label: n, value: n }))}
                    />
                  </div>
                  <div>
                    <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">رقم الهوية <CreditCard className="w-4 h-4 text-[#173A7C]" /></label>
                    <input type="text" value={form.idNumber} onChange={(e) => updateForm("idNumber", e.target.value)} className={inputClass} placeholder="أدخل رقم الهوية أو الإقامة" />
                  </div>
                </div>

                {/* ─── Part 3: Contact and Education ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div>
                    <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">رقم الجوال <Phone className="w-4 h-4 text-[#173A7C]" /></label>
                    <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} dir="ltr" className={`${inputClass} text-right`} placeholder="05XXXXXXXX" />
                  </div>
                  <div>
                    <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">المؤهل الدراسي <GraduationCap className="w-4 h-4 text-[#173A7C]" /></label>
                    <input type="text" value={form.qualification} onChange={(e) => updateForm("qualification", e.target.value)} className={inputClass} placeholder="أدخل مؤهلك الدراسي" />
                  </div>
                  <div>
                    <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">البريد الإلكتروني <Mail className="w-4 h-4 text-[#173A7C]" /></label>
                    <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className={inputClass} placeholder="example@domain.com" />
                  </div>
                </div>

                {/* Submit button */}
                <div className="flex justify-start">
                  <Button type="submit" size="lg" className="px-14 shadow-2xl shadow-[#173A7C]/30 group rounded-full" disabled={loading}>
                    {loading ? "جاري الإرسال..." : <span className="flex items-center gap-3">إشتراك <Send className="w-5 h-5 rtl:rotate-180" /></span>}
                  </Button>
                </div>

              </motion.div>
            </form>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
