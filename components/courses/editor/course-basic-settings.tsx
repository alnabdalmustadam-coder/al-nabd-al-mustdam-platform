'use client';
import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { DeviceImageUploader } from '@/components/dashboard/DeviceImageUploader';
import { EditorField, EditorSectionHeading, EditorToggle, editorInput, editorButton } from './editor-ui';

export type BasicSettings = { title: string; slug: string; category: string; level: string; trainer: string; price: string;
  hours: string; description: string; image: string; professionalDevelopment: boolean };
function EditableChoice({ label, value, options, onChange, onAdd }: { label: string; value: string;
  options: { id: string; label: string }[]; onChange: (value: string) => void; onAdd?: (value: string) => void }) {
  const [adding, setAdding] = useState(false); const [draft, setDraft] = useState('');
  const add = () => { const text = draft.trim(); if (text) { onAdd?.(text); onChange(text); setAdding(false); setDraft(''); } };
  return <div className="min-w-0"><div className="mb-2.5 flex min-h-5 items-center justify-between gap-3"><span className="text-sm font-semibold text-slate-700">{label}</span>
    {onAdd && <button type="button" onClick={() => setAdding(!adding)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-800"><Plus className="h-3.5 w-3.5" />إضافة جديد</button>}</div>
    {adding ? <div className="flex items-center gap-2"><input autoFocus aria-label={`اسم ${label}`} value={draft} onChange={(event) => setDraft(event.target.value)}
      onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} placeholder="اكتب الاسم هنا" className={editorInput} />
      <button type="button" aria-label="إضافة الاسم" onClick={add} className={`${editorButton} !px-3`}><Check className="h-4 w-4" /></button><button type="button" aria-label="إلغاء الإضافة" onClick={() => setAdding(false)} className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-400"><X className="h-4 w-4" /></button></div>
      : <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className={editorInput}>
        {!options.some((option) => option.id === value) && <option value={value}>{value || 'اختر من القائمة'}</option>}
        {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
      </select>}
  </div>;
}
export function CourseBasicSettings({ value, onChange, categories, onAddCategory, trainers, onAddTrainer, onImageBusyChange }: {
  value: BasicSettings; onChange: (patch: Partial<BasicSettings>) => void; categories: { id: string; label: string }[];
  onAddCategory: (value: string) => void; trainers?: string[]; onAddTrainer?: (value: string) => void;
  onImageBusyChange: (busy: boolean) => void;
}) {
  return <div className="space-y-8">
    <EditorSectionHeading eyebrow="الخطوة الأولى" title="تفاصيل تعرّف بدورتك" description="أضف المعلومات الأساسية التي تساعد الطالب على فهم محتوى الدورة واختيار المستوى المناسب." />
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
      <EditorField label="عنوان الدورة"><input required maxLength={200} value={value.title} onChange={(event) => onChange({ title: event.target.value })} placeholder="مثال: أساسيات السلامة المهنية" className={editorInput} /></EditorField>
      <div className="grid gap-x-6 gap-y-6 sm:grid-cols-2">
        <EditableChoice label="التصنيف" value={value.category} options={categories} onChange={(category) => onChange({ category })} onAdd={onAddCategory} />
        <EditorField label="المستوى"><select value={value.level} onChange={(event) => onChange({ level: event.target.value })} className={editorInput}><option value="all">جميع المستويات</option><option value="beginner">مبتدئ</option><option value="intermediate">متوسط</option><option value="advanced">متقدم</option></select></EditorField>
        {trainers ? <EditableChoice label="المدرّب" value={value.trainer} options={trainers.map((name) => ({ id: name, label: name }))} onChange={(trainer) => onChange({ trainer })} onAdd={onAddTrainer} /> : <EditorField label="المدرّب"><input value={value.trainer} readOnly className={editorInput} /></EditorField>}
        <EditorField label="رابط الدورة" hint="اتركه فارغًا لإنشائه تلقائيًا من عنوان الدورة."><input dir="auto" value={value.slug} onChange={(event) => onChange({ slug: event.target.value })} placeholder="مثال: occupational-safety" className={editorInput} /></EditorField>
        <EditorField label="رسوم الدورة (ر.س)"><input inputMode="decimal" type="number" min="0" step="0.01" value={value.price} onChange={(event) => onChange({ price: event.target.value })} placeholder="0 للدورة المجانية" className={editorInput} /></EditorField>
        <EditorField label="عدد ساعات الدورة"><input inputMode="numeric" type="number" min="1" value={value.hours} onChange={(event) => onChange({ hours: event.target.value })} placeholder="مثال: 12" className={editorInput} /></EditorField>
      </div>
      <EditorField label="وصف الدورة" hint="وضّح الفئة المستهدفة والمهارات التي سيكتسبها الطالب."><textarea rows={5} value={value.description} onChange={(event) => onChange({ description: event.target.value })} placeholder="اكتب وصفًا موجزًا وواضحًا عن الدورة…" className={`${editorInput} resize-y leading-8`} /></EditorField>
    </section>
    <section className="space-y-4"><h3 className="text-base font-semibold text-slate-900">إعدادات التعلّم</h3>
      <EditorToggle title="وضع التطوير المهني" enabled={value.professionalDevelopment} onChange={(professionalDevelopment) => onChange({ professionalDevelopment })}
        description="يلتزم الطالب بترتيب الدروس، ويشاهد الفيديو كاملًا ويجتاز الاختبار المرتبط قبل الانتقال إلى الدرس التالي." />
      {value.professionalDevelopment && <p className="rounded-xl bg-amber-50 px-5 py-3 text-xs leading-6 text-amber-900">عند تفعيله لدورة موجودة، يحتاج التقدم السابق المسجّل يدويًا إلى التحقق من المشاهدة.</p>}
    </section>
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><div><h3 className="text-base font-semibold text-slate-900">غلاف الدورة</h3><p className="mt-1 text-xs leading-6 text-slate-500">اختر صورة واضحة تعبّر عن محتوى الدورة.</p></div>
      <DeviceImageUploader value={value.image} onChange={(image) => onChange({ image })} onBusyChange={onImageBusyChange} folder="courses" slug={value.slug || 'course'} label="صورة غلاف الدورة" recommendedSize="المقاس المناسب: 1280 × 720 بكسل" aspectRatio="video" />
    </section>
  </div>;
}
