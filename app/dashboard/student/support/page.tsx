'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Headphones,
  Send,
  HelpCircle,
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const sectionFadeVariants: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.16,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.12,
      delayChildren: custom * 0.16 + 0.08,
    },
  }),
};

const textItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

interface TicketItem {
  id: string;
  ticket_number: string;
  subject: string;
  message: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  replies: { id: string; message: string; is_admin_reply: boolean; created_at: string }[];
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function getCategoryLabel(cat: string): string {
  switch (cat) {
    case 'academic': return 'أكاديمي';
    case 'technical': return 'تقني';
    case 'billing': return 'مالي';
    case 'certificates': return 'شهادات واعتمادات';
    default: return cat || 'عام';
  }
}

function getStatusBadge(status: string) {
  switch (status?.toUpperCase()) {
    case 'OPEN':
      return { label: 'مفتوحة - قيد المراجعة', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'IN_PROGRESS':
      return { label: 'جاري المعالجة', color: 'bg-blue-50 text-[#173A7C] border-blue-200' };
    case 'ANSWERED':
      return { label: 'تم الرد من الفريق', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'CLOSED':
      return { label: 'مغلقة - تم الإنجاز', color: 'bg-slate-100 text-slate-600 border-slate-200' };
    default:
      return { label: status || 'قيد المعالجة', color: 'bg-amber-50 text-amber-700 border-amber-200' };
  }
}

export default function StudentSupportPage() {
  const [activeTab, setActiveTab] = useState<'tickets' | 'new' | 'faq'>('tickets');
  const [ticketsList, setTicketsList] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('academic');
  const [ticketDetails, setTicketDetails] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Load tickets from Supabase
  useEffect(() => {
    async function loadTickets() {
      try {
        const supabase = createClient();
        const { data: authData } = await supabase.auth.getUser();
        const user = authData?.user;

        if (user) {
          const userEmail = user.email?.toLowerCase().trim() || '';

          // Fetch tickets
          const { data: ticketsData, error } = await supabase
            .from('support_tickets')
            .select('*')
            .or(`email.eq.${userEmail},user_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching tickets:', error);
          }

          if (ticketsData && ticketsData.length > 0) {
            // Fetch replies for each ticket
            const ticketIds = ticketsData.map((t: any) => t.id);
            const { data: repliesData } = await supabase
              .from('ticket_replies')
              .select('*')
              .in('ticket_id', ticketIds)
              .order('created_at', { ascending: true });

            const ticketsWithReplies = ticketsData.map((t: any) => ({
              ...t,
              replies: (repliesData || []).filter((r: any) => r.ticket_id === t.id),
            }));

            setTicketsList(ticketsWithReplies);
          }
        }
      } catch (err) {
        console.error('Error loading support tickets:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTickets();
  }, []);

  // Submit new ticket to Supabase
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDetails.trim()) return;

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        alert('يرجى تسجيل الدخول أولاً');
        return;
      }

      const ticketNumber = `TICK-${Date.now().toString().slice(-6)}`;
      const userEmail = user.email?.toLowerCase().trim() || '';

      const { data: newTicket, error } = await supabase
        .from('support_tickets')
        .insert({
          ticket_number: ticketNumber,
          user_id: user.id,
          email: userEmail,
          category: ticketCategory,
          subject: ticketSubject,
          message: ticketDetails,
          status: 'OPEN',
          priority: 'NORMAL',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating ticket:', error);
        alert('حدث خطأ أثناء إنشاء التذكرة. يرجى المحاولة مرة أخرى.');
        return;
      }

      if (newTicket) {
        setTicketsList([{ ...newTicket, replies: [] }, ...ticketsList]);
        setSubmittedSuccess(true);
        setTicketSubject('');
        setTicketDetails('');
        setTimeout(() => {
          setSubmittedSuccess(false);
          setActiveTab('tickets');
        }, 2000);
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'كيف يمكنني الحصول على الشهادة بعد إكمال الدورة التدريبية؟',
      a: 'تظهر الشهادة تلقائياً في صفحة "شهاداتي المعتمدة" بمجرد مشاهدة كافة الدروس واجتياز الاختبار النهائي بنجاح.',
    },
    {
      q: 'ما هي شروط احتساب نسبة الحضور والإنجاز؟',
      a: 'يتم احتساب النسبة آلياً بمجرد مشاهدة كل فيديو تعليمي بالكامل والضغط على زر "تحديد كـ مكتمل".',
    },
    {
      q: 'هل يمكنني التواصل المباشر مع محاضر المادة؟',
      a: 'نعم، من خلال تبويب "النقاش مع الأستاذ" الموجود بصفحة الدرس، أو من خلال إرسال استفسار عبر هذه اللوحة.',
    },
    {
      q: 'ماذا أفعل إذا واجهت مشكلة في تشغيل الفيديو؟',
      a: 'تأكد أولاً من جودة الاتصال بالإنترنت، وفي حال استمرار المشكلة تواصل معنا عبر زر تقديم تذكرة دعم فني جديدة.',
    },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Banner */}
      <motion.div
        variants={sectionFadeVariants}
        initial="hidden"
        animate="visible"
        custom={0}
        className="relative z-20 liquid-glass-hero p-6 sm:p-8 md:p-9 space-y-4 liquid-glass-hover overflow-hidden student-card-accent rounded-2xl sm:rounded-3xl"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-emerald-400/20 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-gradient-to-br from-blue-600/15 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-2.5 sm:space-y-3 pr-2">
            <motion.div variants={textItemVariants} className="student-tag-badge bg-blue-50 text-[#173A7C] border border-blue-200/80 shadow-xs">
              <Headphones className="w-3.5 h-3.5 text-[#173A7C]" />
              <span>مركز الدعم الأكاديمي والخدمات الذاتية</span>
            </motion.div>

            <motion.h1 variants={textItemVariants} className="student-heading-h1">
              الدعم و<span className="student-name-gradient">المساعدة الأكاديمية</span> 🎧
            </motion.h1>

            <motion.p variants={textItemVariants} className="student-text-body max-w-xl pr-0.5 pt-1.5 sm:pt-2 leading-relaxed">
              تواصل مع الفريق الأكاديمي والتقني، تتبع تذاكر استفساراتك، أو تصفح الأسئلة الشائعة.
            </motion.p>
          </div>

          <motion.div variants={textItemVariants} className="premium-tabs grid grid-cols-2 xs:grid-cols-3 sm:flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/90 border border-white/80 backdrop-blur-md w-full sm:w-auto shrink-0 shadow-sm">
            <button
              onClick={() => setActiveTab('tickets')}
              className={`premium-tab px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
              }`}
            >
              <span className="premium-tab-label">تذاكري ({ticketsList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`premium-tab px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
              }`}
            >
              <span className="premium-tab-label">+ تقديم تذكرة</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`premium-tab px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center col-span-2 xs:col-span-1 cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white shadow-md shadow-[#173A7C]/20'
                  : 'text-slate-600 hover:text-[#173A7C] hover:bg-slate-100/60'
              }`}
            >
              <span className="premium-tab-label">الأسئلة الشائعة</span>
            </button>
          </motion.div>
        </div>
      </motion.div>

      {/* TAB 1: My Tickets List */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <motion.h2
            variants={sectionFadeVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C]"
          >
            <div className="p-1.5 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <span>تذاكر الاستفسارات النشطة والحساب</span>
          </motion.h2>

          {loading ? (
            <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#173A7C]" />
              <p className="text-xs font-bold text-slate-500">جاري تحميل تذاكر الدعم...</p>
            </div>
          ) : ticketsList.length === 0 ? (
            <div className="p-10 sm:p-14 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#173A7C]/10 text-[#173A7C] flex items-center justify-center mx-auto">
                <Headphones className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">لا توجد تذاكر مسجلة</h3>
                <p className="text-xs font-bold text-slate-500 max-w-md mx-auto">
                  يمكنك تقديم تذكرة استفسار جديدة وسيتم الرد عليك في أقرب وقت من فريق الدعم.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('new')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] text-white font-black text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>تقديم تذكرة جديدة</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ticketsList.map((ticket, idx) => {
                const statusInfo = getStatusBadge(ticket.status);
                const lastReply = ticket.replies && ticket.replies.length > 0
                  ? ticket.replies[ticket.replies.length - 1]
                  : null;

                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + idx * 0.14, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 space-y-4 liquid-glass-card liquid-glass-hover student-card-accent"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-200/50">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono font-black text-[#173A7C] text-xs bg-blue-50/90 px-3.5 py-1.5 rounded-xl border border-blue-200/80 shadow-2xs">
                          {ticket.ticket_number}
                        </span>
                        <span className="px-3.5 py-1.5 rounded-xl bg-slate-100/80 text-slate-500 font-bold text-xs border border-slate-200/60">
                          {formatDate(ticket.created_at)}
                        </span>
                        <span className="text-xs font-black text-slate-700 bg-slate-100/90 px-3.5 py-1.5 rounded-full border border-slate-200/60">
                          القسم: {getCategoryLabel(ticket.category)}
                        </span>
                      </div>

                      <span className={`text-xs font-black px-4 py-1.5 rounded-full border shadow-xs whitespace-nowrap ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="student-heading-h3 text-xs sm:text-base mb-2">
                        {ticket.subject}
                      </h3>

                      {/* Original message */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/60 text-xs text-slate-600 font-bold leading-relaxed space-y-1 mb-3">
                        <span className="text-[#173A7C] font-black block text-xs">رسالتك الأصلية:</span>
                        <p className="text-slate-700">{ticket.message}</p>
                      </div>

                      {/* Replies */}
                      {ticket.replies && ticket.replies.length > 0 && (
                        <div className="space-y-2">
                          {ticket.replies.map((reply) => (
                            <div
                              key={reply.id}
                              className={`p-4 sm:p-5 rounded-2xl text-xs font-bold leading-relaxed space-y-1 ${
                                reply.is_admin_reply
                                  ? 'bg-emerald-50/80 border border-emerald-200/60'
                                  : 'bg-blue-50/80 border border-blue-200/60'
                              }`}
                            >
                              <span className={`font-black block text-xs ${reply.is_admin_reply ? 'text-emerald-700' : 'text-[#173A7C]'}`}>
                                {reply.is_admin_reply ? 'رد فريق الدعم:' : 'ردك:'}
                              </span>
                              <p className="text-slate-700">{reply.message}</p>
                              <span className="text-[10px] text-slate-400 font-bold">{formatDate(reply.created_at)}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {lastReply === null && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-700 font-bold leading-relaxed flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>جاري مراجعة الطلب من فريق الدعم والرد عليك في أقرب وقت.</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Submit New Ticket */}
      {activeTab === 'new' && (
        <motion.div
          variants={sectionFadeVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="relative overflow-hidden rounded-2xl sm:rounded-[28px] p-6 sm:p-8 space-y-6 liquid-glass-card liquid-glass-hover student-card-accent"
        >
          <div className="space-y-1">
            <h2 className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C]">
              <div className="p-1.5 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
                <Send className="w-4 h-4" />
              </div>
              <span>تقديم تذكرة استفسار جديدة</span>
            </h2>
            <p className="text-xs text-slate-500 font-bold pr-3.5 pt-1">
              اختر القسم المخصص واكتب تفاصيل استفسارك وسيتم الرد عليك في أقرب وقت.
            </p>
          </div>

          {submittedSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#5CB07C]" />
              <span>تم إرسال تذكرتك بنجاح وجاري إحالتها للقسم المختص!</span>
            </div>
          )}

          <form onSubmit={handleSubmitTicket} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">عنوان الاستفسار</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="مثال: استفسار بخصوص موعد الاختبار النهائي"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">تحديد القسم</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70"
                >
                  <option value="academic">استفسار أكاديمي / شؤون تعليمية</option>
                  <option value="technical">الدعم التقني والمشغل</option>
                  <option value="billing">المالية والفواتير</option>
                  <option value="certificates">الشهادات والاعتمادات</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">تفاصيل الاستفسار والرسالة</label>
              <textarea
                required
                rows={5}
                value={ticketDetails}
                onChange={(e) => setTicketDetails(e.target.value)}
                placeholder="اكتب جميع التفاصيل المطلوبة لمساعدتك بسرعة وبشكل دقيق..."
                className="w-full p-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#173A7C] bg-white/70 leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#173A7C]/20 cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{submitting ? 'جاري الإرسال...' : 'إرسال التذكرة الآن'}</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* TAB 3: FAQ */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          <motion.h2
            variants={sectionFadeVariants}
            initial="hidden"
            animate="visible"
            custom={1}
            className="student-heading-h2 flex items-center gap-2.5 pr-2.5 border-r-4 border-[#5CB07C]"
          >
            <div className="p-1.5 rounded-xl text-[#0D5C3A] bg-emerald-100/90 border border-emerald-300/80 shadow-xs">
              <HelpCircle className="w-4 h-4" />
            </div>
            <span>الأسئلة الشائعة والخدمات الذاتية</span>
          </motion.h2>

          <div className="space-y-3.5">
            {faqs.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 + idx * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl space-y-2.5 liquid-glass-card liquid-glass-hover student-card-accent"
              >
                <h3 className="student-heading-h3 text-xs sm:text-base flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#5CB07C] shrink-0" />
                  <span>{item.q}</span>
                </h3>
                <p className="text-xs text-slate-600 font-semibold leading-relaxed pr-5">
                  {item.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
