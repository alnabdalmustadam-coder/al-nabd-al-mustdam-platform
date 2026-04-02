"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, CheckCircle2, XCircle, ArrowLeft, ArrowRight, Send, Trophy, RotateCcw, GraduationCap, Target, Sparkles, AlertCircle, Mail, MessageCircle, Loader2 } from "lucide-react";
import React, { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════
   QUESTIONS
   ═══════════════════════════════════════════════════════════════════════ */
interface Question { id: number; text: string; options: string[]; correct: number; points: number; }

const questions: Question[] = [
  { id: 1, text: "Where .............. from? I'm from Saudi.", options: ["you are", "you", "are you"], correct: 2, points: 2 },
  { id: 2, text: "I have two ................, a boy and a girl.", options: ["sons", "daughters", "children"], correct: 2, points: 2 },
  { id: 3, text: "This is my brother ........................ name's Ahmed.", options: ["Her", "His", "He's"], correct: 1, points: 2 },
  { id: 4, text: "I get up ................ 7 o'clock in the morning.", options: ["for", "at", "is"], correct: 1, points: 2 },
  { id: 5, text: "How much are ................ shoes?", options: ["this", "these", "that"], correct: 1, points: 2 },
  { id: 6, text: "I don't see my parents very often ................ they live in South Africa.", options: ["so", "but", "because"], correct: 2, points: 2 },
  { id: 7, text: "She ................ to the gym every day.", options: ["go", "goes", "going"], correct: 1, points: 2 },
  { id: 8, text: "They ................ watching TV right now.", options: ["is", "was", "are"], correct: 2, points: 2 },
  { id: 9, text: "We ................ to London last summer.", options: ["go", "went", "gone"], correct: 1, points: 2 },
  { id: 10, text: "Have you ever ................ sushi?", options: ["eat", "ate", "eaten"], correct: 2, points: 2 },
  { id: 11, text: "Did Amina finish the report? No. She ............ it tomorrow.", options: ["finishes", "is going to finish", "finished"], correct: 1, points: 2 },
  { id: 12, text: "................ anywhere interesting recently?", options: ["Do you go", "Have you been", "Will you go", "Are you going"], correct: 1, points: 2 },
  { id: 13, text: "What clothes should I pack for a trip to Boston? Well, it depends ................ the time of year that you go.", options: ["on", "to", "with", "up"], correct: 0, points: 2 },
  { id: 14, text: "Very rarely ................ here in July.", options: ["it rains", "is it raining", "it is raining", "does it rain"], correct: 3, points: 2 },
  { id: 15, text: "If I ................ you, I'd take the job.", options: ["am", "was", "were", "be"], correct: 2, points: 2 },
  { id: 16, text: "The book ................ by millions of people.", options: ["has read", "has been read", "has been reading", "is reading"], correct: 1, points: 2 },
  { id: 17, text: "She asked me where I ................", options: ["live", "lived", "am living", "living"], correct: 1, points: 2 },
  { id: 18, text: "Pia was ................ delighted with the birthday present.", options: ["completely", "very", "absolutely", "fairly"], correct: 2, points: 2 },
  { id: 19, text: "I don't think the colours in Julia's outfit ................ together.", options: ["fit", "suit", "match", "go"], correct: 3, points: 2 },
  { id: 20, text: "Paula ................ loves working with children.", options: ["very", "really", "much", "more"], correct: 1, points: 2 },
  { id: 21, text: "I ................ a lot of sport in my free time.", options: ["make", "do", "practise", "exercise"], correct: 1, points: 2 },
  { id: 22, text: "My mum's not very well. Oh, ................", options: ["it doesn't matter", "I do apologise", "sorry to hear that", "not bad, thanks"], correct: 2, points: 2 },
  { id: 23, text: "I've finished this salad and I'm still hungry. I ................ ordered something more filling.", options: ["may have", "would have", "must have", "should have"], correct: 3, points: 2 },
  { id: 24, text: "The amount of organically grown food on sale has ................ enormously in recent years.", options: ["raised", "increased", "built", "lifted"], correct: 1, points: 2 },
  { id: 25, text: "Life is a ................ deal easier for immigrants who can speak the local language.", options: ["huge", "far", "big", "great"], correct: 3, points: 2 },
];

const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
const TIMER_MINUTES = 10;

function getLevel(score: number) {
  const pct = (score / totalPoints) * 100;
  if (pct >= 90) return { label: "Advanced (C1)", labelAr: "متقدم", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", emoji: "🏆", ring: "ring-emerald-500/20" };
  if (pct >= 75) return { label: "Upper-Intermediate (B2)", labelAr: "فوق المتوسط", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", emoji: "🌟", ring: "ring-blue-500/20" };
  if (pct >= 55) return { label: "Intermediate (B1)", labelAr: "متوسط", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200", emoji: "📚", ring: "ring-indigo-500/20" };
  if (pct >= 35) return { label: "Elementary (A2)", labelAr: "مبتدئ متقدم", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", emoji: "✏️", ring: "ring-amber-500/20" };
  return { label: "Beginner (A1)", labelAr: "مبتدئ", color: "text-rose-600", bg: "bg-rose-50 border-rose-200", emoji: "🔤", ring: "ring-rose-500/20" };
}

/* ═══════════════════════════════════════════════════════════════════════ */
export default function EnglishEvaluationPage() {
  type Step = "register" | "test" | "writing" | "results";
  const [step, setStep] = useState<Step>("register");
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [section, setSection] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [email, setEmail] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [timeLeft, setTimeLeft] = useState(TIMER_MINUTES * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [writingAnswer, setWritingAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [emailStatus, setEmailStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const emailSentRef = useRef(false);

  useEffect(() => {
    if (!timerActive || step !== "test") return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerActive, timeLeft, step]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const handleRegister = (e: React.FormEvent) => { e.preventDefault(); setStep("test"); setTimerActive(true); };
  const selectAnswer = (idx: number) => { const u = [...answers]; u[currentQ] = idx; setAnswers(u); };
  const goNext = () => { if (currentQ < questions.length - 1) setCurrentQ(c => c + 1); };
  const goPrev = () => { if (currentQ > 0) setCurrentQ(c => c - 1); };
  const handleFinish = useCallback(() => { setTimerActive(false); setStep("writing"); }, []);

  const handleSubmitAll = () => {
    let s = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correct) s += q.points; });
    setScore(s);
    setStep("results");
  };

  /* ─── Auto-send email when results step loads ─── */
  useEffect(() => {
    if (step === "results" && !emailSentRef.current) {
      emailSentRef.current = true;
      sendResultsEmail();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const buildResultsSummary = () => {
    const pct = Math.round((score / totalPoints) * 100);
    const level = getLevel(score);
    const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
    let details = "";
    questions.forEach((q, i) => {
      const userAns = answers[i] !== null ? q.options[answers[i]!] : "Skipped";
      const correctAns = q.options[q.correct];
      const mark = answers[i] === q.correct ? "✅" : "❌";
      details += `${q.id}. ${mark} Student: ${userAns} | Correct: ${correctAns}\n`;
    });
    return { pct, level, correctCount, details };
  };

  const sendResultsEmail = async () => {
    setEmailStatus("sending");
    const pct = Math.round((score / totalPoints) * 100);
    const level = getLevel(score);
    const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
    const detailed = questions.map((q, i) => ({
      id: q.id,
      question: q.text,
      student: answers[i] !== null ? q.options[answers[i]!] : "Skipped",
      correct: q.options[q.correct],
      isCorrect: answers[i] === q.correct,
    }));
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "placement-test",
          student_name: name,
          student_email: email,
          student_phone: phone,
          student_id: idNumber,
          student_specialization: specialization,
          student_section: section,
          score, total: totalPoints, percentage: pct,
          level: level.label, levelAr: level.labelAr,
          correct_count: correctCount, total_questions: questions.length,
          writing_answer: writingAnswer || "N/A",
          detailed_answers: detailed,
        }),
      });
      if (res.ok) setEmailStatus("sent");
      else setEmailStatus("error");
    } catch {
      setEmailStatus("error");
    }
  };

  const sendViaWhatsApp = () => {
    const pct = Math.round((score / totalPoints) * 100);
    const level = getLevel(score);
    const correctCount = questions.filter((q, i) => answers[i] === q.correct).length;
    const wrongCount = questions.length - correctCount;

    let text = ``;
    text += `🏫 *معهد النبض المستدام*\n`;
    text += `📋 *تقرير اختبار تحديد المستوى (لغة إنجليزية)*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `👤 *بيانات المتدرب*\n`;
    text += `▸ الاسم: *${name}*\n`;
    text += `▸ رقم الجوال: ${phone}\n`;
    text += `▸ رقم الهوية: ${idNumber}\n`;
    text += `▸ البريد الإلكتروني: ${email}\n`;
    text += `▸ التخصص: ${specialization}\n`;
    text += `▸ القسم: ${section}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `📊 *نتيجة الاختبار*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

    text += `🏆 *الدرجة:* ${score} / ${totalPoints}\n`;
    text += `📈 *النسبة:* ${pct}%\n`;
    text += `🎯 *المستوى:* ${level.emoji} ${level.labelAr}\n`;
    text += `      _(${level.label})_\n\n`;

    text += `✅ إجابات صحيحة: ${correctCount}  |  ❌ إجابات خاطئة: ${wrongCount}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `✍️ *قسم الكتابة*\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `${writingAnswer || "لا يوجد"}\n\n`;

    text += `━━━━━━━━━━━━━━━━━━━━━\n`;
    text += `_تم الإنشاء آلياً عبر منصة النبض المستدام_`;

    window.open(`https://wa.me/966549105986?text=${encodeURIComponent(text)}`, "_blank");
  };

  const sendViaMailto = () => {
    const { pct, level, correctCount, details } = buildResultsSummary();
    let body = `Placement Test Results\n\nName: ${name}\nPhone: ${phone}\nID: ${idNumber}\nEmail: ${email}\nSpecialization: ${specialization}\nSection: ${section}\n\n`;
    body += `Score: ${score}/${totalPoints} (${pct}%)\nLevel: ${level.label} (${level.labelAr})\nCorrect: ${correctCount}/${questions.length}\n\nWriting:\n${writingAnswer || "N/A"}\n\nDetailed Answers:\n${details}`;
    window.open(`mailto:alnabdalmustadam@gmail.com?subject=${encodeURIComponent(`Placement Test - ${name}`)}&body=${encodeURIComponent(body)}`, "_blank");
  };

  const handleRestart = () => {
    setStep("register"); setName(""); setSpecialization(""); setSection(""); setPhone(""); setIdNumber(""); setEmail("");
    setAnswers(new Array(questions.length).fill(null)); setCurrentQ(0); setTimeLeft(TIMER_MINUTES * 60);
    setTimerActive(false); setWritingAnswer(""); setScore(0); setShowReview(false); setEmailStatus("idle"); emailSentRef.current = false;
  };

  const answeredCount = answers.filter(a => a !== null).length;
  const progressPct = (answeredCount / questions.length) * 100;

  const inputClass = "w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173A7C]/15 focus:border-[#173A7C]/40 transition-all duration-300 shadow-sm";

  return (
    <div className="min-h-screen relative overflow-hidden" dir="ltr">
      {/* ═══════════ LIGHT BG ═══════════ */}
      <div className="fixed inset-0 z-0">
        <img src="/bg.webp" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.92] via-slate-50/[0.88] to-blue-50/[0.85]" />
      </div>
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#5CB07C]/[0.06] rounded-full blur-[200px] pointer-events-none -translate-y-1/2 translate-x-1/3 z-0" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-[#173A7C]/[0.06] rounded-full blur-[180px] pointer-events-none translate-y-1/2 -translate-x-1/3 z-0" />

      <div className="relative z-10 pb-24 pt-[calc(10vh+5rem)]">
        {/* ═══════════ HEADER ═══════════ */}
        <section className="relative px-4 sm:px-6 mb-12 max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 shadow-sm mb-6">
              <GraduationCap className="w-4 h-4 text-[#173A7C]" />
              <span className="text-xs font-extrabold text-slate-700 tracking-wide uppercase">Sustain Pulse Institute</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-5 tracking-tight leading-tight">
              English <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173A7C] to-[#5CB07C]">Placement Test</span>
            </h1>
            <p className="text-slate-500 text-base sm:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Assess your English proficiency level with our comprehensive Written Test. Choose the best answer for each question — stop when the questions become too difficult.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-8 text-sm font-bold text-slate-400">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#5CB07C]" /> 10 Minutes</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
              <span className="flex items-center gap-2"><Target className="w-4 h-4 text-[#5CB07C]" /> 25 Questions</span>
              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[#5CB07C]" /> {totalPoints} Points</span>
            </div>
          </motion.div>
        </section>

        <AnimatePresence mode="wait">
          {/* ═══════════════════ REGISTER ═══════════════════ */}
          {step === "register" && (
            <motion.section key="register" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto px-4 sm:px-6">
              <form onSubmit={handleRegister} className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.1)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#5CB07C]/[0.04] to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] flex items-center justify-center shadow-lg shadow-[#173A7C]/20">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">Student Information</h2>
                    <p className="text-sm text-slate-400 font-medium mt-1"><span className="text-red-500">*</span> Indicates required question</p>
                  </div>
                </div>
                <div className="space-y-5 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-bold text-slate-700 mb-1.5 block">NAME / الاسم <span className="text-red-500">*</span></label>
                      <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-slate-700 mb-1.5 block">Specialization / التخصص <span className="text-red-500">*</span></label>
                      <input required value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="Your specialization" className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-bold text-slate-700 mb-1.5 block">Section / القسم <span className="text-red-500">*</span></label>
                      <input required value={section} onChange={e => setSection(e.target.value)} placeholder="Your section" className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-slate-700 mb-1.5 block">Mobile / رقم الجوال <span className="text-red-500">*</span></label>
                      <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="05XXXXXXXX" className={inputClass} /></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="text-sm font-bold text-slate-700 mb-1.5 block">ID Number / رقم الهوية <span className="text-red-500">*</span></label>
                      <input required value={idNumber} onChange={e => setIdNumber(e.target.value)} placeholder="National ID" className={inputClass} /></div>
                    <div><label className="text-sm font-bold text-slate-700 mb-1.5 block">EMAIL / البريد <span className="text-red-500">*</span></label>
                      <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={inputClass} /></div>
                  </div>
                </div>
                <div className="mt-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 relative z-10">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 font-medium leading-relaxed">
                    <strong>Written Test Instructions:</strong>
                    <ul className="mt-1.5 space-y-1 list-disc list-inside marker:text-amber-400">
                      <li>Choose the best answer for each question.</li>
                      <li>Stop when the questions become too difficult.</li>
                      <li>Spend no more than 10 minutes on the test.</li>
                    </ul>
                  </div>
                </div>
                <button type="submit" className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#2F66D6] hover:shadow-xl text-white font-bold text-base transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-[#173A7C]/20 flex items-center justify-center gap-3 relative z-10">
                  <span>Start the Test</span><ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </motion.section>
          )}

          {/* ═══════════════════ TEST ═══════════════════ */}
          {step === "test" && (
            <motion.section key="test" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-4 sm:px-6">
              {/* Top Bar */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-md mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                <div className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-mono text-lg font-black border ${timeLeft <= 60 ? "bg-red-50 text-red-600 border-red-200 animate-pulse" : "bg-slate-50 text-slate-700 border-slate-200"}`}>
                  <Clock className="w-5 h-5" /><span>{formatTime(timeLeft)}</span>
                </div>
                <div className="flex-1 w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-400">{answeredCount} / {questions.length} Answered</span>
                    <span className="text-xs font-bold text-[#5CB07C]">{Math.round(progressPct)}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-[#173A7C] to-[#5CB07C] rounded-full" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.4 }} />
                  </div>
                </div>
                <button onClick={handleFinish} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#5CB07C] to-[#3d9060] text-white text-sm font-bold transition-all hover:-translate-y-0.5 shadow-lg shadow-[#5CB07C]/20 whitespace-nowrap">Finish Test →</button>
              </div>

              {/* Navigator */}
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-6">
                <div className="flex flex-wrap justify-center gap-2">
                  {questions.map((_, i) => (
                    <button key={i} onClick={() => setCurrentQ(i)} className={`w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 border ${
                      i === currentQ
                        ? "bg-[#173A7C] text-white border-[#173A7C] shadow-lg shadow-[#173A7C]/20 scale-110"
                        : answers[i] !== null
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                    }`}>{i + 1}</button>
                  ))}
                </div>
              </div>

              {/* Question */}
              <AnimatePresence mode="wait">
                <motion.div key={currentQ} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#173A7C]/[0.03] to-transparent rounded-br-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-4">
                      <span className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#173A7C] to-[#2F66D6] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#173A7C]/20">{questions[currentQ].id}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {questions[currentQ].id} of {questions.length}</p>
                        <p className="text-sm font-bold text-[#5CB07C]">{questions[currentQ].points} Points</p>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-10 leading-relaxed relative z-10">{questions[currentQ].text}</h2>
                  <div className="space-y-3 relative z-10">
                    {questions[currentQ].options.map((opt, idx) => {
                      const isSelected = answers[currentQ] === idx;
                      const letter = String.fromCharCode(65 + idx);
                      return (
                        <button key={idx} onClick={() => selectAnswer(idx)} className={`w-full text-left px-6 py-5 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group ${
                          isSelected ? "border-[#173A7C] bg-[#173A7C]/5 shadow-lg shadow-[#173A7C]/10" : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-sm"
                        }`}>
                          <span className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-all ${isSelected ? "bg-[#173A7C] text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200"}`}>{letter}</span>
                          <span className={`text-[15px] sm:text-base font-semibold transition-colors ${isSelected ? "text-[#173A7C]" : "text-slate-600"}`}>{opt}</span>
                          {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto"><CheckCircle2 className="w-5 h-5 text-[#173A7C]" /></motion.div>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-10 relative z-10">
                    <button onClick={goPrev} disabled={currentQ === 0} className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-30"><ArrowLeft className="w-4 h-4" /> Previous</button>
                    {currentQ < questions.length - 1 ? (
                      <button onClick={goNext} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-[#173A7C] hover:bg-[#0A162B] transition-all shadow-md hover:-translate-y-0.5">Next <ArrowRight className="w-4 h-4" /></button>
                    ) : (
                      <button onClick={handleFinish} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#5CB07C] to-[#3d9060] shadow-lg transition-all hover:-translate-y-0.5">Finish <Send className="w-4 h-4" /></button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.section>
          )}

          {/* ═══════════════════ WRITING ═══════════════════ */}
          {step === "writing" && (
            <motion.section key="writing" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto px-4 sm:px-6">
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.08)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/[0.04] to-transparent rounded-bl-full pointer-events-none" />
                <div className="flex items-center gap-4 mb-3 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center shadow-inner"><BookOpen className="w-7 h-7 text-purple-600" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">The Second Quotation</p><h2 className="text-2xl font-black text-slate-900">Writing Section</h2></div>
                </div>
                <p className="text-sm text-slate-400 font-medium mb-8 relative z-10">This section is reviewed separately and does not affect your multiple-choice score.</p>
                <div className="space-y-2 relative z-10">
                  <label className="text-base font-bold text-slate-800">Talk about yourself: <span className="text-red-500">*</span></label>
                  <textarea value={writingAnswer} onChange={e => setWritingAnswer(e.target.value)} rows={8} placeholder="Write about yourself in English..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-[15px] font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-y leading-relaxed shadow-sm" />
                </div>
                <button onClick={handleSubmitAll} className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#5CB07C] text-white font-bold text-base transition-all duration-300 hover:-translate-y-1 shadow-xl flex items-center justify-center gap-3 relative z-10"><Send className="w-5 h-5" /><span>Submit Test</span></button>
              </div>
            </motion.section>
          )}

          {/* ═══════════════════ RESULTS ═══════════════════ */}
          {step === "results" && (
            <motion.section key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
              <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(23,58,124,0.1)] text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#173A7C]/[0.02] to-[#5CB07C]/[0.02] pointer-events-none" />

                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative z-10">
                  <div className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-[#173A7C] to-[#5CB07C] flex items-center justify-center shadow-2xl shadow-[#173A7C]/20">
                    <Trophy className="w-14 h-14 text-white" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2">Test Completed!</h2>
                  <p className="text-slate-400 font-medium mb-10">{name}, here are your results</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto mb-10">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Score</p>
                    <p className="text-4xl font-black text-slate-900">{score}<span className="text-lg text-slate-300">/{totalPoints}</span></p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Percentage</p>
                    <p className={`text-4xl font-black ${getLevel(score).color}`}>{Math.round((score / totalPoints) * 100)}%</p>
                  </div>
                  <div className={`rounded-2xl p-6 border ${getLevel(score).bg}`}>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Level</p>
                    <p className={`text-lg font-black ${getLevel(score).color}`}>{getLevel(score).emoji} {getLevel(score).label}</p>
                  </div>
                </motion.div>

                {/* Auto Email Status */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative z-10 mb-8">
                  <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border text-sm font-bold ${
                    emailStatus === "sending" ? "bg-blue-50 border-blue-200 text-blue-600" :
                    emailStatus === "sent"    ? "bg-emerald-50 border-emerald-200 text-emerald-600" :
                    emailStatus === "error"   ? "bg-amber-50 border-amber-200 text-amber-600" :
                    "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    {emailStatus === "sending" && <><Loader2 className="w-4 h-4 animate-spin" /> Sending results to institute...</>}
                    {emailStatus === "sent"    && <><CheckCircle2 className="w-4 h-4" /> Results sent automatically to the institute ✓</>}
                    {emailStatus === "error"   && <><AlertCircle className="w-4 h-4" /> Auto-send failed — use manual options below</>}
                    {emailStatus === "idle"    && <><Mail className="w-4 h-4" /> Preparing to send...</>}
                  </div>
                </motion.div>

                {/* Manual Send Options */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="relative z-10 mb-8">
                  <p className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider">Manual Send Options</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={sendViaWhatsApp} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#128C7E] font-bold text-sm transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                      <MessageCircle className="w-5 h-5" /> WhatsApp
                    </button>
                    <button onClick={sendViaMailto} className="flex items-center gap-3 px-6 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 font-bold text-sm transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center">
                      <Mail className="w-5 h-5" /> Email
                    </button>
                  </div>
                </motion.div>

                <div className="flex flex-wrap items-center justify-center gap-4 relative z-10">
                  <button onClick={() => setShowReview(!showReview)} className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-sm font-bold text-slate-600 transition-all flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> {showReview ? "Hide Review" : "Review Answers"}
                  </button>
                  <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#2F66D6] text-sm font-bold text-white transition-all flex items-center gap-2 shadow-lg hover:-translate-y-0.5">
                    <RotateCcw className="w-4 h-4" /> Retake Test
                  </button>
                </div>
              </div>

              {/* Review */}
              <AnimatePresence>
                {showReview && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                    {questions.map((q, i) => {
                      const isCorrect = answers[i] === q.correct;
                      const userAnswer = answers[i];
                      return (
                        <div key={q.id} className={`bg-white rounded-2xl p-6 border-2 ${isCorrect ? "border-emerald-200" : userAnswer === null ? "border-slate-200" : "border-red-200"}`}>
                          <div className="flex items-start gap-4">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isCorrect ? "bg-emerald-50 text-emerald-700" : userAnswer === null ? "bg-slate-50 text-slate-400" : "bg-red-50 text-red-600"}`}>{q.id}</span>
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 mb-3">{q.text}</p>
                              <div className="flex flex-wrap gap-2">
                                {q.options.map((opt, oi) => (
                                  <span key={oi} className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                                    oi === q.correct ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                    oi === userAnswer && !isCorrect ? "bg-red-50 text-red-600 border-red-200 line-through" :
                                    "bg-slate-50 text-slate-400 border-slate-200"
                                  }`}>
                                    {String.fromCharCode(65 + oi)}. {opt}
                                    {oi === q.correct && <CheckCircle2 className="w-3.5 h-3.5 inline ml-1" />}
                                    {oi === userAnswer && !isCorrect && <XCircle className="w-3.5 h-3.5 inline ml-1" />}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
