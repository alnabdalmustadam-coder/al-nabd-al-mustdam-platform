'use client';
import { useState } from 'react';
import { Plus, Check, X, BookOpen, LayoutGrid, BarChart3, UserRound, Link2, Wallet, Clock3, AlignRight, Image, Settings2, ShieldCheck, type LucideIcon } from 'lucide-react';
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';
import { EditorCardHeading, EditorField, EditorSectionHeading, EditorToggle, editorInput, editorButton } from './editor-ui';
import { EditorSelect } from './editor-select';

export type BasicSettings = { title: string; slug: string; category: string; level: string; trainer: string; price: string;
  hours: string; description: string; image: string; professionalDevelopment: boolean };
function EditableChoice({ label, value, options, onChange, onAdd, icon: Icon }: { label: string; value: string; icon: LucideIcon;
  options: { id: string; label: string }[]; onChange: (value: string) => void; onAdd?: (value: string) => void }) {
  const [adding, setAdding] = useState(false); const [draft, setDraft] = useState('');
  const add = () => { const text = draft.trim(); if (text) { onAdd?.(text); onChange(text); setAdding(false); setDraft(''); } };
  return <div className="min-w-0"><div className="mb-2.5 flex min-h-7 items-center justify-between gap-3"><span className="flex items-center gap-2 text-sm font-semibold text-slate-700"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} /></span>{label}</span>
    {onAdd && <button type="button" onClick={() => setAdding(!adding)} className="inline-flex min-h-7 items-center gap-1 rounded-lg bg-blue-50/70 px-2 text-xs font-medium text-blue-800 hover:bg-blue-100"><Plus className="h-3.5 w-3.5" />إضافة جديد</button>}</div>
    {adding ? <div className="flex items-center gap-2"><input autoFocus aria-label={`اسم ${label}`} value={draft} onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} placeholder="اكتب الاسم هنا" className={editorInput} />
      <button type="button" aria-label="إضافة الاسم" onClick={add} className={`${editorButton} !px-3`}><Check className="h-4 w-4" /></button><button type="button" aria-label="إلغاء الإضافة" onClick={() => setAdding(false)} className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400"><X className="h-4 w-4" /></button></div>
      : <EditorSelect label={label} value={value} onChange={onChange} options={options} searchable />}
  </div>;
}
export function CourseBasicSettings({ value, onChange, categories, onAddCategory, trainers, onAddTrainer, onImageBusyChange }: {
  value: BasicSettings; onChange: (patch: Partial<BasicSettings>) => void; categories: { id: string; label: string }[];
  onAddCategory: (value: string) => void; trainers?: string[]; onAddTrainer?: (value: string) => void;
  onImageBusyChange: (busy: boolean) => void;
}) {
  return <div className="space-y-8">
    <EditorSectionHeading eyebrow="بيانات الدورة" title="البيانات الأساسية للدورة" description="جهّز هوية الدورة ومعلوماتها، وحدّد إعدادات تجربة التعلّم المناسبة لطلابك." />
    <section data-editor-panel className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <div className="border-b border-slate-100 pb-5"><EditorCardHeading icon={BookOpen} title="هوية الدورة" description="المعلومات التي تظهر للطالب في صفحة الدورة." /></div>
      <EditorField icon={BookOpen} label="عنوان الدورة"><input required maxLength={200} value={value.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="مثال: أساسيات السلامة المهنية" className={editorInput} /></EditorField>
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
        <EditableChoice icon={LayoutGrid} label="التصنيف" value={value.category} options={categories} onChange={(category) => onChange({ category })} onAdd={onAddCategory} />
        <EditorField icon={BarChart3} label="المستوى"><EditorSelect label="المستوى" value={value.level} onChange={(level) => onChange({ level })} options={[{ id: 'all', label: 'جميع المستويات' }, { id: 'beginner', label: 'مبتدئ' }, { id: 'intermediate', label: 'متوسط' }, { id: 'advanced', label: 'متقدم' }]} /></EditorField>
        {trainers ? <EditableChoice icon={UserRound} label="المدرّب" value={value.trainer} options={trainers.map((name) => ({ id: name, label: name }))} onChange={(trainer) => onChange({ trainer })} onAdd={onAddTrainer} /> : <EditorField icon={UserRound} label="المدرّب"><input value={value.trainer} readOnly className={editorInput} /></EditorField>}
        <EditorField icon={Link2} label="رابط الدورة" hint="اتركه فارغًا لإنشائه تلقائيًا من عنوان الدورة."><input dir="auto" value={value.slug} onChange={(event) => onChange({ slug: event.target.value })} placeholder="مثال: occupational-safety" className={editorInput} /></EditorField>
        <EditorField icon={Wallet} label="رسوم الدورة (ر.س)"><input inputMode="decimal" type="number" min="0" step="0.01" value={value.price} onChange={(event) => onChange({ price: event.target.value })} placeholder="0 للدورة المجانية" className={editorInput} /></EditorField>
        <EditorField icon={Clock3} label="عدد ساعات الدورة"><input inputMode="numeric" type="number" min="1" value={value.hours} onChange={(event) => onChange({ hours: event.target.value })} placeholder="مثال: 12" className={editorInput} /></EditorField>
      </div>
      <EditorField icon={AlignRight} label="وصف الدورة" hint="وضّح الفئة المستهدفة والمهارات التي سيكتسبها الطالب."><textarea rows={5} value={value.description} onChange={(event) => onChange({ description: event.target.value })} placeholder="اكتب وصفًا موجزًا وواضحًا عن الدورة…" className={`${editorInput} resize-y leading-8`} /></EditorField>
    </section>
    <section className="space-y-4"><EditorCardHeading icon={Settings2} title="إعدادات التعلّم" description="حدّد طريقة تقدّم الطالب في محتوى الدورة." />
      <EditorToggle icon={ShieldCheck} title="وضع التطوير المهني" enabled={value.professionalDevelopment} onChange={(professionalDevelopment) => onChange({ professionalDevelopment })}
        description="يلتزم الطالب بترتيب الدروس، ويشاهد الفيديو كاملًا ويجتاز الاختبار المرتبط قبل الانتقال إلى الدرس التالي." />
      {value.professionalDevelopment && <p className="rounded-xl bg-amber-50 px-5 py-3 text-xs leading-6 text-amber-900">عند تفعيله لدورة موجودة، يحتاج التقدم السابق المسجّل يدويًا إلى التحقق من المشاهدة.</p>}
    </section>
    <section data-editor-panel className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><EditorCardHeading icon={Image} title="غلاف الدورة" description="صورة واضحة تعكس محتوى الدورة وهويتها." meta="1280 × 720" />
      <DeviceImageUploader value={value.image} onChange={(image) => onChange({ image })} onBusyChange={onImageBusyChange} folder="courses" slug={value.slug || 'course'} label="صورة غلاف الدورة" recommendedSize="المقاس المناسب: 1280 × 720 بكسل" aspectRatio="video" />
    </section>
  </div>;
}
