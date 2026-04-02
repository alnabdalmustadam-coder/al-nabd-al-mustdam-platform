"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/ui/Button";
import {
  Send, CheckCircle, User, Phone, Briefcase, Building,
  Sparkles, Target, BookOpen, Layers, GraduationCap,
  ChevronLeft, ChevronRight, Lightbulb
} from "lucide-react";
import { courses } from "@/data/courses";
import { corporateCourses } from "@/data/corporateCourses";

interface FormState {
  name: string;
  phone: string;
  jobTitle: string;
  employer: string;
  department: string;
  
  trainerName: string;
  courseName: string;

  keyIdeas: string;
  appliedSkills: string[];
  managerOpinion: string;
}

const initialFormState: FormState = {
  name: "",
  phone: "",
  jobTitle: "",
  employer: "",
  department: "",
  
  trainerName: "",
  courseName: "",
  
  keyIdeas: "",
  appliedSkills: ["", "", "", ""],
  managerOpinion: "",
};

const trainersList = [
  "أ. محمد أحمد عبده",
  "م. عبدالله حسن السهلي",
  "د. عبدالرحمن صالح العمودي",
  "أ. خالد تركي الجهني",
  "د. هبة خالد الشمري",
  "م. سارة سعد الدوسري",
  "أ. فاطمة سعيد الغامدي"
];

const steps = [
  { id: 0, label: "البيانات الأساسية", icon: User },
  { id: 1, label: "التطبيقات والمهارات", icon: Lightbulb },
];

const CustomDropdown = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label?: string; items: { value: string; label: string }[] }[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const displayValue = options.map(b => b.items).flat().find(o => o.value === value)?.label || placeholder;

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
                {options.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-2 last:mb-0">
                    {group.label && (
                      <div className="px-3 py-2 text-xs font-bold text-slate-400 bg-slate-50/50 rounded-lg mb-1">
                        {group.label}
                      </div>
                    )}
                    {group.items.map((item, itemIndex) => (
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
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function SkillsApplicationsPage() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [alertModal, setAlertModal] = useState<{ open: boolean; type: "warning" | "error"; message: string }>({ open: false, type: "warning", message: "" });

  const showAlert = (message: string, type: "warning" | "error" = "warning") => {
    setAlertModal({ open: true, type, message });
  };

  const updateForm = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateArrayField = (key: "appliedSkills", index: number, value: string) => {
    setForm((prev) => {
      const newArray = [...prev[key]];
      newArray[index] = value;
      return { ...prev, [key]: newArray };
    });
  };

  /* ═══ Completion progress ═══ */
  const progress = useMemo(() => {
    const hasName = form.name.trim() !== "";
    const hasPhone = form.phone.trim() !== "";
    const hasTrainer = form.trainerName !== "";
    const hasCourse = form.courseName !== "";
    const hasKeyIdeas = form.keyIdeas.trim() !== "";
    const hasAppliedSkills = form.appliedSkills.some(s => s.trim() !== "");
    const hasManagerOpinion = form.managerOpinion.trim() !== "";
    
    let filledCount = [hasName, hasPhone, hasTrainer, hasCourse, hasKeyIdeas, hasAppliedSkills, hasManagerOpinion].filter(Boolean).length;
    return Math.round((filledCount / 7) * 100);
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.trainerName || !form.courseName) {
      setActiveStep(0);
      window.scrollTo({ top: 200, behavior: "smooth" });
      showAlert("يرجى إكمال البيانات الأساسية واختيار الدورة والمدرب أولاً", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "skills-applications", ...form }),
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

  const goNext = () => {
    if (activeStep === 0 && (!form.name.trim() || !form.phone.trim() || !form.trainerName || !form.courseName)) {
      showAlert("يرجى ملء كافة الحقول الإجبارية (الاسم، الجوال، الدورة، المدرب)", "warning");
      return;
    }
    if (activeStep < steps.length - 1) setActiveStep((s) => s + 1);
    window.scrollTo({ top: 200, behavior: "smooth" });
  };
  const goPrev = () => { if (activeStep > 0) setActiveStep((s) => s - 1); window.scrollTo({ top: 200, behavior: "smooth" }); };

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
              <span className="text-xs font-extrabold text-slate-700 tracking-wide">نموذج التقييم</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-black text-slate-900 mb-5 tracking-tight leading-tight">
              استمارة مهارات وتطبيقات{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">
                البرنامج التدريبي
              </span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              نهدف من خلال هذا النموذج إلى توثيق أبرز مخرجات التدريب والتطبيقات العملية لضمان تحقيق أقصى استفادة لك ولجهتك.
            </p>

            {/* Progress indicator */}
            <div className="mt-8 max-w-sm mx-auto">
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
                    <GraduationCap className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">تم الإرسال بنجاح!</h2>
                  <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-8">
                    شكراً لك لمشاركتنا مخرجات وتطبيقات البرنامج. نتمنى لك التوفيق في رحلتك المهنية.
                  </p>
                </motion.div>
              </div>
            </motion.section>
          ) : (
            /* ═══════════ FORM ═══════════ */
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6">
              {/* ═══ Step Navigation ═══ */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-2.5 border border-white/60 shadow-lg flex items-center gap-1.5">
                  {steps.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = activeStep === i;
                    const isPast = activeStep > i;
                    return (
                      <button
                        key={step.id}
                        type="button"
                        onClick={() => { setActiveStep(i); window.scrollTo({ top: 200, behavior: "smooth" }); }}
                        className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 px-2 sm:px-4 py-3 sm:py-3.5 rounded-[1.25rem] text-xs sm:text-sm font-bold transition-all duration-300 whitespace-nowrap ${isActive
                            ? "bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] text-white shadow-lg shadow-[#173A7C]/20"
                            : isPast
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                          }`}
                      >
                        {isPast && !isActive ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        <span className="hidden sm:inline">{step.label}</span>
                        <span className="sm:hidden text-[10px]">{step.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* ═══ Step Content ═══ */}
              <AnimatePresence mode="wait">
                {/* ─── Step 0: Personal and Course Info ─── */}
                {activeStep === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-visible"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] flex items-center justify-center shadow-lg shadow-[#173A7C]/20">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">البيانات الأساسية للبرنامج</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">يُرجى اختيار بيانات الدورة والمدرب</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <User className="w-4 h-4 text-[#173A7C]" /> الاسم <span className="text-red-500">*</span>
                        </label>
                        <input type="text" required value={form.name} onChange={(e) => updateForm("name", e.target.value)} className={inputClass} placeholder="أدخل اسمك الكريم" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Phone className="w-4 h-4 text-[#173A7C]" /> رقم الجوال <span className="text-red-500">*</span>
                        </label>
                        <input type="tel" required value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} dir="ltr" className={`${inputClass} text-right`} placeholder="05XXXXXXXX" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Briefcase className="w-4 h-4 text-[#173A7C]" /> المسمى الوظيفي
                        </label>
                        <input type="text" value={form.jobTitle} onChange={(e) => updateForm("jobTitle", e.target.value)} className={inputClass} placeholder="مثال: مسؤول مبيعات" />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Building className="w-4 h-4 text-[#173A7C]" /> الجهة
                        </label>
                        <input type="text" value={form.employer} onChange={(e) => updateForm("employer", e.target.value)} className={inputClass} placeholder="جهة العمل الحالية" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <Layers className="w-4 h-4 text-[#173A7C]" /> القسم
                        </label>
                        <input type="text" value={form.department} onChange={(e) => updateForm("department", e.target.value)} className={inputClass} placeholder="القسم الذي تعمل به" />
                      </div>
                    </div>

                    <hr className="border-slate-100 my-8" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      <div className="relative z-[60]">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <BookOpen className="w-4 h-4 text-blue-600" /> اسم الدورة <span className="text-red-500">*</span>
                        </label>
                        <CustomDropdown
                          value={form.courseName}
                          onChange={(val) => updateForm("courseName", val)}
                          placeholder="-- من فضلك اختار الدورة المراد تقييمها --"
                          options={[
                            {
                              label: "الدورات المعتمدة",
                              items: courses.map(c => ({ label: c.title, value: c.title }))
                            },
                            {
                              label: "دورات الشركات",
                              items: corporateCourses.slice(0, 30).map(c => ({ label: c.title, value: c.title }))
                            }
                          ]}
                        />
                      </div>
                      
                      <div className="relative z-[50]">
                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                          <User className="w-4 h-4 text-blue-600" /> اسم المدرب <span className="text-red-500">*</span>
                        </label>
                        <CustomDropdown
                          value={form.trainerName}
                          onChange={(val) => updateForm("trainerName", val)}
                          placeholder="-- من فضلك اختار اسم المدرب --"
                          options={[
                            {
                              items: trainersList.map(t => ({ label: t, value: t }))
                            }
                          ]}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ─── Step 1: Applications and Skills ─── */}
                {activeStep === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4 }}
                    className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-visible"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Lightbulb className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">التطبيقات والأفكار</h2>
                        <p className="text-sm text-slate-400 font-medium mt-1">مخرجاتك المستفادة ورؤيتك للتطبيق</p>
                      </div>
                    </div>

                    <div className="space-y-10">
                      <div>
                        <label className="block text-[15px] font-bold text-slate-800 mb-3">
                          أبرز وأهم الأفكار في البرنامج
                        </label>
                        <textarea rows={4} value={form.keyIdeas} onChange={(e) => updateForm("keyIdeas", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all text-[15px] resize-none leading-relaxed" placeholder="أدخل أبرز وأهم الأفكار المستفادة..." />
                      </div>

                      <div>
                        <label className="block text-[15px] font-bold text-slate-800 mb-4">
                          أهم التطبيقات والمهارات التي سأطبقها
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[0, 1, 2, 3].map((i) => (
                            <input key={`skillOut-${i}`} type="text" value={form.appliedSkills[i]} onChange={(e) => updateArrayField("appliedSkills", i, e.target.value)} className={inputClass} placeholder={`التطبيقات والمهارات ${i + 1}`} />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-[15px] font-bold text-slate-800 mb-3">
                          رأي الرئيس المباشر / المستفيد
                        </label>
                        <textarea rows={4} value={form.managerOpinion} onChange={(e) => updateForm("managerOpinion", e.target.value)} className="w-full px-6 py-5 rounded-[20px] bg-slate-50 border border-slate-200 text-slate-900 focus:border-[#173A7C] focus:ring-2 focus:ring-[#173A7C]/15 outline-none transition-all text-[15px] resize-none leading-relaxed" placeholder="رأي الرئيس المباشر أو الملاحظات الختامية..." />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ Navigation Footer ═══ */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 flex items-center justify-between gap-4">
                <button type="button" onClick={goPrev} disabled={activeStep === 0} className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-slate-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
                  <ChevronRight className="w-4 h-4" /> السابق
                </button>
                <div className="flex items-center gap-2">
                  {steps.map((_, i) => <div key={i} className={`h-2 rounded-full transition-all duration-500 ${activeStep === i ? "w-8 bg-[#173A7C]" : "w-2 bg-slate-200"}`} />)}
                </div>
                {activeStep < steps.length - 1 ? (
                  <button type="button" onClick={goNext} className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#173A7C] to-[#2E5EA6] transition-all shadow-lg shadow-[#173A7C]/20 hover:shadow-xl hover:-translate-y-0.5">
                    التالي <ChevronLeft className="w-4 h-4" />
                  </button>
                ) : (
                  <Button type="submit" size="lg" className="px-10 shadow-xl shadow-[#173A7C]/20 group rounded-full" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        جاري الإرسال...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2"><Send className="w-5 h-5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5" /> إرسال البيانات</span>
                    )}
                  </Button>
                )}
              </motion.div>
            </form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
