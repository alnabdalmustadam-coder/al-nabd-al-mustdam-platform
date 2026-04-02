"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  Send, CheckCircle, User, Phone, MapPin,
  Sparkles, MessageSquare, ChevronLeft, ChevronRight,
  ClipboardList, Globe, Building2
} from "lucide-react";

interface FormState {
  name: string;
  city: string;
  phone: string;
  participationPreference: string;
  suggestedCourses: string;
  suggestedTrainers: string;
}

const initialFormState: FormState = {
  name: "",
  city: "",
  phone: "",
  participationPreference: "",
  suggestedCourses: "",
  suggestedTrainers: "",
};

const participationOptions = [
  "عن بعد (أونلاين) مع استمرار الأسعار المخفضة",
  "الحضور في قاعات فندقية حسب الإجراءات الاحترازية مع عودة الأسعار القديمة",
  "لا مانع بأي طريقة مما سبق"
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
              className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-[1.25rem] shadow-xl shadow-slate-200/50 z-50 overflow-hidden max-h-64 overflow-y-auto custom-scrollbar"
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

export default function CoursesSurveyPage() {
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
    const hasName = form.name.trim() !== "";
    const hasCity = form.city.trim() !== "";
    const hasPhone = form.phone.trim() !== "";
    const hasPref = form.participationPreference !== "";
    
    let filledCount = [hasName, hasCity, hasPhone, hasPref].filter(Boolean).length;
    return Math.round((filledCount / 4) * 100);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim()) {
      showAlert("يرجى ملء الاسم ورقم الجوال أولاً", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "courses-survey", ...form }),
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
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#5CB07C]/[0.06] rounded-full blur-[200px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#173A7C]/[0.06] rounded-full blur-[180px] pointer-events-none translate-y-1/2 -translate-x-1/3 z-0" />

      <div className="relative z-10 pb-24 pt-28">
        {/* ═══════════ HERO HEADER ═══════════ */}
        <section className="relative px-4 sm:px-6 mb-12 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#173A7C]" />
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">الاستشارات والتدريب</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-5 tracking-tight leading-tight">
              استطلاع رأي عن{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
                إقامة الدورات
              </span>
            </h1>
            
            <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-10 border border-white/60 shadow-xl max-w-3xl mx-auto text-right mt-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#173A7C]/[0.05] rounded-bl-full pointer-events-none" />
              <h3 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-3 justify-end leading-relaxed">
                عزيزي المتدرب / عزيزتي المتدربة
                <Building2 className="w-6 h-6 text-[#173A7C]" />
              </h3>
              <p className="text-slate-600 text-[15px] sm:text-base font-medium leading-loose">
                السلام عليكم ورحمة الله وبركاته،،
                <br /><br />
                إيماناً منا بأهمية آراء عملائنا الكرام ورغبةً منا في تلبية احتياجات المتدربين والمتدربات فإنه يسرنا ويسعدنا التعرف على آرائكم في ظل الوضع الراهن وتطبيق الاحترازات الوقائية والصحية والعودة بحذر حسب التوجيهات الصادرة من حكومتنا الرشيدة للحد من آثار الجائحة حفظنا الله وإياكم وبلادنا من كل شر ومكروه.
                لذا حرصنا على وضع هذه الاستبانة بين أيديكم لمشاركتنا القرار خلال الفترة القادمة وفي ظل السماح من قبل المؤسسة العامة للتدريب بعودة الدورات الحضورية لمن يرغب.. رأيكم يهمنا فأنتم شركاؤنا في النجاح
              </p>
            </div>

            {/* Progress indicator */}
            <div className="mt-12 max-w-sm mx-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400">نسبة الإكمال</span>
                <span className="text-xs font-black text-[#5CB07C]">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
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
                    <CheckCircle className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">تم الإرسال بنجاح!</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
                    شكراً لمشاركتنا رأيك القيمة. سنأخذ اقتراحاتك بعين الاعتبار في خططنا القادمة.
                  </p>
                </motion.div>
              </div>
            </motion.section>
          ) : (
            /* ═══════════ FORM ═══════════ */
            <section className="max-w-4xl mx-auto px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 border border-white/60 shadow-xl relative overflow-visible">
                  
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] flex items-center justify-center shadow-lg shadow-[#173A7C]/20">
                      <ClipboardList className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-black text-slate-900">بيانات الاستطلاع</h2>
                      <p className="text-sm text-slate-400 font-medium mt-1">يُرجى تعبئة الحقول بعناية</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="text-right">
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">
                        الاسم <User className="w-4 h-4 text-[#173A7C]" />
                      </label>
                      <input type="text" value={form.name} onChange={(e) => updateForm("name", e.target.value)} className={inputClass} placeholder="اسم المتدرب" />
                    </div>
                    <div className="text-right">
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">
                        المدينة <MapPin className="w-4 h-4 text-[#173A7C]" />
                      </label>
                      <input type="text" value={form.city} onChange={(e) => updateForm("city", e.target.value)} className={inputClass} placeholder="أدخل اسم المدينة" />
                    </div>
                    <div className="text-right">
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-700 mb-2.5">
                        رقم التواصل واتس <Phone className="w-4 h-4 text-[#173A7C]" />
                      </label>
                      <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} dir="ltr" className={`${inputClass} text-right`} placeholder="05XXXXXXXX" />
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="text-right">
                      <label className="flex items-center justify-end gap-2 text-sm font-bold text-slate-800 mb-4">
                        أرغب في المشاركة في الدورات <Globe className="w-5 h-5 text-[#173A7C]" />
                      </label>
                      <div className="relative">
                        <CustomDropdown
                          value={form.participationPreference}
                          onChange={(val) => updateForm("participationPreference", val)}
                          placeholder="-- يرجى اختيار أحد الخيارات --"
                          options={participationOptions.map(opt => ({ label: opt, value: opt }))}
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <label className="block text-[15px] font-bold text-slate-800 mb-3">
                        ضع اقتراحك لدورات مناسبة
                      </label>
                      <textarea rows={4} value={form.suggestedCourses} onChange={(e) => updateForm("suggestedCourses", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all text-[15px] resize-none leading-relaxed text-right" placeholder="كتابة اقتراحاتك هنا..." />
                    </div>

                    <div className="text-right">
                      <label className="block text-[15px] font-bold text-slate-800 mb-3">
                        ضع اقتراحك لأسماء مدربين لتقديم الدورات
                      </label>
                      <textarea rows={4} value={form.suggestedTrainers} onChange={(e) => updateForm("suggestedTrainers", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all text-[15px] resize-none leading-relaxed text-right" placeholder="أسماء مدربين ترشحهم..." />
                    </div>
                  </div>

                  <div className="mt-12 flex justify-start">
                    <Button type="submit" size="lg" className="px-12 shadow-xl shadow-[#173A7C]/20 group rounded-full" disabled={loading}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                          جاري الإرسال...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 text-base font-bold tracking-wide">
                          إرسال <Send className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </div>
                </motion.div>
              </form>
            </section>
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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
