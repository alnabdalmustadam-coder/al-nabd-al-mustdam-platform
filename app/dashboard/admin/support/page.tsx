'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Headphones,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Send,
  Sparkles,
  Paperclip,
  ChevronLeft,
  X,
  Inbox,
  Check,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id?: string;
  email?: string;
  studentName: string;
  subject: string;
  message: string;
  category: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';
  priority: string;
  created_at: string;
  replies: { id: string; message: string; is_admin_reply: boolean; created_at: string }[];
}

export default function AdminSupportPage() {
  const [filter, setFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED'>('all');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReply, setSendingReply] = useState(false);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data: ticketsData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching support tickets:', error);
      }

      if (ticketsData && ticketsData.length > 0) {
        const ticketIds = ticketsData.map((t: any) => t.id);
        const { data: repliesData } = await supabase
          .from('ticket_replies')
          .select('*')
          .in('ticket_id', ticketIds)
          .order('created_at', { ascending: true });

        const mapped: SupportTicket[] = ticketsData.map((t: any) => ({
          id: t.id,
          ticket_number: t.ticket_number || 'TICK-000',
          user_id: t.user_id,
          email: t.email,
          studentName: t.email ? t.email.split('@')[0] : 'متدرب',
          subject: t.subject,
          message: t.message,
          category: t.category,
          status: t.status || 'OPEN',
          priority: t.priority || 'NORMAL',
          created_at: t.created_at,
          replies: (repliesData || []).filter((r: any) => r.ticket_id === t.id),
        }));

        setTickets(mapped);
        if (selectedTicket) {
          const updated = mapped.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return;

    try {
      setSendingReply(true);
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      const { error } = await supabase.from('ticket_replies').insert({
        ticket_id: selectedTicket.id,
        user_id: user?.id || null,
        message: replyMessage.trim(),
        is_admin_reply: true,
      });

      if (error) {
        console.error(error);
        alert('حدث خطأ أثناء إرسال الرد.');
        return;
      }

      // Update ticket status to ANSWERED
      await supabase
        .from('support_tickets')
        .update({ status: 'ANSWERED', updated_at: new Date().toISOString() })
        .eq('id', selectedTicket.id);

      setReplyMessage('');
      loadTickets();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const supabase = createClient();
      await supabase
        .from('support_tickets')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesFilter = filter === 'all' ? true : t.status === filter;
    const matchesSearch =
      t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-[family-name:var(--font-cairo)] text-slate-800" dir="rtl">
      {/* Hero Header */}
      <div className="relative z-20 liquid-glass-hero p-6 sm:p-8 rounded-2xl sm:rounded-3xl liquid-glass-hover overflow-hidden student-card-accent">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="admin-hero-tag bg-blue-50 text-[#173A7C] border border-blue-200">
              <Headphones className="w-4 h-4 text-blue-600 shrink-0" />
              <span>خدمة العملاء والدعم الأكاديمي والتقني</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black student-heading-h1">
              إدارة <span className="student-name-gradient">تذاكر واستفسارات المتدربين</span> 🎧
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-xl">
              متابعة استفسارات الطلاب، حل المشكلات التقنية والأكاديمية، والرد السريع على التذاكر.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-4 py-2 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-xs">
              {tickets.filter((t) => t.status === 'OPEN').length} تذكرة مفتوحة
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم التذكرة، الاسم، أو الموضوع..."
            className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/80"
          />
        </div>

        <div className="premium-tabs flex items-center gap-1.5 flex-wrap">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'OPEN', label: 'مفتوحة' },
            { key: 'IN_PROGRESS', label: 'قيد المعالجة' },
            { key: 'ANSWERED', label: 'تم الرد' },
            { key: 'CLOSED', label: 'مغلقة' },
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setFilter(st.key as any)}
              className={`premium-tab px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === st.key
                  ? 'bg-[#173A7C] text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className="premium-tab-label">{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List and Chat View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-3">
          {loading ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#173A7C] mx-auto" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs font-bold text-slate-500">
              لا توجد تذاكر مطابقة
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTicket(t)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedTicket?.id === t.id
                    ? 'bg-blue-50/80 border-[#173A7C] shadow-sm'
                    : 'bg-white/80 border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black text-[#173A7C] bg-white px-2 py-0.5 rounded-lg border border-blue-200">
                    {t.ticket_number}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      t.status === 'OPEN'
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : t.status === 'ANSWERED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {t.status === 'OPEN' ? 'جديدة' : t.status === 'ANSWERED' ? 'تم الرد' : t.status}
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 line-clamp-1">{t.subject}</h4>
                <p className="text-[11px] text-slate-500 font-bold line-clamp-2">{t.message}</p>
                <span className="text-[10px] text-slate-400 font-bold block">{t.studentName}</span>
              </div>
            ))
          )}
        </div>

        {/* Ticket Details & Reply Area */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="p-6 rounded-3xl liquid-glass-card space-y-5 student-card-accent">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-[#173A7C] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-200">
                      {selectedTicket.ticket_number}
                    </span>
                    <span className="text-xs font-black text-slate-600">{selectedTicket.studentName} ({selectedTicket.email})</span>
                  </div>
                  <h3 className="student-heading-h3 pt-1">{selectedTicket.subject}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none"
                  >
                    <option value="OPEN">مفتوحة (OPEN)</option>
                    <option value="IN_PROGRESS">قيد المعالجة (IN_PROGRESS)</option>
                    <option value="ANSWERED">تم الرد (ANSWERED)</option>
                    <option value="CLOSED">مغلقة (CLOSED)</option>
                  </select>
                </div>
              </div>

              {/* Original Message */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 space-y-1">
                <span className="font-black text-[#173A7C] block">رسالة المتدرب:</span>
                <p className="leading-relaxed">{selectedTicket.message}</p>
              </div>

              {/* Replies History */}
              {selectedTicket.replies && selectedTicket.replies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-slate-800">سجل الردود:</h4>
                  {selectedTicket.replies.map((r) => (
                    <div
                      key={r.id}
                      className={`p-4 rounded-2xl text-xs font-bold leading-relaxed space-y-1 ${
                        r.is_admin_reply
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                          : 'bg-blue-50 border border-blue-200 text-[#173A7C]'
                      }`}
                    >
                      <span className="font-black block">
                        {r.is_admin_reply ? 'رد فريق الإدارة / الدعم:' : 'رد المتدرب:'}
                      </span>
                      <p>{r.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply Box */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60">
                <label className="text-xs font-black text-slate-700">إرسال رد رسمي للمتدرب:</label>
                <textarea
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="اكتب ردك الواضح والشافي للمتدرب..."
                  className="w-full p-4 rounded-2xl border border-slate-200 text-xs font-bold focus:outline-none focus:border-[#173A7C] bg-white/90 leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    disabled={sendingReply || !replyMessage.trim()}
                    onClick={handleSendReply}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#173A7C] to-[#1E4D9D] hover:from-[#1E4D9D] hover:to-[#173A7C] text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {sendingReply ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{sendingReply ? 'جاري الإرسال...' : 'إرسال الرد وتحديث الحالة'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white/80 border border-slate-200/80 text-center space-y-3">
              <Inbox className="w-12 h-12 text-[#173A7C]/30 mx-auto" />
              <h3 className="text-sm font-black text-slate-700">اختر تذكرة من القائمة للرد عليها ومتابعتها</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
