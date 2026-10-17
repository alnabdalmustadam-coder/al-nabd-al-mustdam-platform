'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { QuizData, QuizQuestion } from '@/types';
import type { StudentQuizAnswer, StudentQuizQuestion } from '@/lib/quizzes/model';
import { EditorField, editorInput, editorButton } from '@/components/courses/editor/editor-ui';
import { MatchingQuestion } from '@/components/quizzes/matching-question';

function MatchingPreview({ question }: { question: QuizQuestion }) {
  const [answer, setAnswer] = useState<StudentQuizAnswer>();
  const pairs = question.pairs || [];
  const valid = pairs.length >= 2 && pairs.every((pair) => pair.prompt.trim() && pair.answer.trim())
    && new Set(pairs.map((pair) => pair.answer.trim())).size === pairs.length;
  const preview = useMemo<StudentQuizQuestion>(() => ({ id: question.id, text: question.question, type: 'matching',
    prompts: (question.pairs || []).map((pair) => pair.prompt.trim()),
    options: (question.pairs || []).map((pair) => pair.answer.trim()).sort((a, b) => a.localeCompare(b, 'ar')) }), [question]);
  return <details className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 sm:p-5">
    <summary className="cursor-pointer text-sm font-semibold leading-7 text-blue-900">معاينة شكل السؤال للطالب</summary>
    <div className="mt-3">{valid
      ? <MatchingQuestion question={preview} answer={answer} onChange={setAnswer} />
      : <p className="text-xs leading-6 text-slate-500">أكمل عبارتين وإجابتيهما على الأقل لعرض المعاينة، مع إجابات مختلفة لكل عبارة.</p>}</div>
  </details>;
}

export function CourseQuizEditor({ value, onChange }: { value: QuizData; onChange: (quiz: QuizData) => void }) {
  const editorId = useId();
  const update = (index: number, patch: Partial<QuizQuestion>) => onChange({ ...value,
    questions: value.questions.map((question, i) => i === index ? { ...question, ...patch } : question) });
  const add = (matching: boolean) => { if (value.questions.length >= 200) return; onChange({ ...value, questions: [...value.questions, {
    id: `q-${crypto.randomUUID()}`, type: matching ? 'matching' : 'multiple_choice', question: '',
    options: matching ? [] : ['', '', '', ''], correctIndex: matching ? -1 : 0,
    ...(matching ? { pairs: [0, 1].map(() => ({ id: crypto.randomUUID(), prompt: '', answer: '' })) } : {}),
  }] }); };
  const field = editorInput;
  return <div className="space-y-6" dir="rtl">
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
      <EditorField label="عنوان الاختبار"><input className={field} value={value.title} maxLength={200} placeholder="مثال: اختبار المفاهيم الأساسية" onChange={(event) => onChange({ ...value, title: event.target.value })} /></EditorField>
      <EditorField label="نسبة الاجتياز (%)"><input type="number" min={0} max={100} className={field} value={value.passingScore ?? 70} onChange={(event) => onChange({ ...value, passingScore: Number(event.target.value) })} /></EditorField>
    </div>
    {value.questions.map((question, index) => <section key={question.id} className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-blue-900">{index + 1}</span><h4 className="text-sm font-semibold leading-7 text-slate-800">{question.type === 'matching' ? 'توصيل الإجابات' : 'اختيار من متعدد'}</h4></div>
        <button type="button" aria-label={`حذف السؤال ${index + 1}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-4 focus-visible:ring-rose-100"
          onClick={() => onChange({ ...value, questions: value.questions.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></button>
      </div>
      <EditorField label="نص السؤال"><textarea required rows={2} maxLength={2000} className={`${field} resize-y leading-7`} value={question.question}
        placeholder={question.type === 'matching' ? 'مثال: صِل كل مصطلح بتعريفه المناسب' : 'اكتب سؤالًا واضحًا، ثم أضف الاختيارات أدناه'} onChange={(event) => update(index, { question: event.target.value })} /></EditorField>
      {question.type === 'matching' ? <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-500">أضف كل عبارة مع إجابتها الصحيحة. تظهر الإجابات للطالب بترتيب مستقل ليصل بينها.</p>
        <div className="hidden grid-cols-2 gap-4 pl-12 text-xs font-semibold text-slate-500 sm:grid"><span>العبارات والأسئلة</span><span>الإجابات المطابقة</span></div>
        {(question.pairs || []).map((pair, pairIndex) => <div key={pair.id} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
            {(['prompt', 'answer'] as const).map((side) => <input key={side} required maxLength={500}
              aria-label={`${side === 'prompt' ? 'العبارة' : 'الإجابة'} ${pairIndex + 1} للسؤال ${index + 1}`}
              placeholder={side === 'prompt' ? `العبارة أو المصطلح ${pairIndex + 1}` : `الإجابة المطابقة للعبارة ${pairIndex + 1}`} className={field} value={pair[side]}
              onChange={(event) => update(index, { pairs: question.pairs?.map((item, i) => i === pairIndex ? { ...item, [side]: event.target.value } : item) })} />)}
          </div>
          {(question.pairs?.length || 0) > 2 ? <button type="button" className="flex h-12 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`حذف الزوج ${pairIndex + 1}`}
            onClick={() => update(index, { pairs: question.pairs?.filter((_, i) => i !== pairIndex) })}><Trash2 className="h-4 w-4" /></button> : <span className="hidden w-9 shrink-0 sm:block" />}
        </div>)}
        {(question.pairs?.length || 0) < 10 && <button type="button" className={editorButton} onClick={() => update(index, { pairs: [...(question.pairs || []), { id: crypto.randomUUID(), prompt: '', answer: '' }] })}><Plus className="h-4 w-4" />إضافة عبارة وإجابة</button>}
        <MatchingPreview key={JSON.stringify(question.pairs)} question={question} />
      </div> : <div className="space-y-4">
        <p className="text-sm leading-7 text-slate-500">أضف الاختيارات، وحدّد الإجابة الصحيحة من الدائرة بجانبها.</p>
        <div className="grid gap-3 sm:grid-cols-2">{question.options.map((option, optionIndex) => <div key={optionIndex} className={`flex items-center gap-1 rounded-xl border p-1 ${question.correctIndex === optionIndex ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-200 bg-white'}`}>
          <label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center"><input type="radio" className="h-[18px] w-[18px] accent-emerald-600" aria-label={`الإجابة الصحيحة: الخيار ${optionIndex + 1} للسؤال ${index + 1}`} name={`${editorId}-correct-${question.id}`} checked={question.correctIndex === optionIndex} onChange={() => update(index, { correctIndex: optionIndex })} /></label>
          <input required maxLength={500} aria-label={`الخيار ${optionIndex + 1} للسؤال ${index + 1}`} className={`${field} !border-transparent !bg-transparent !px-2`} value={option} placeholder={`اكتب الاختيار ${optionIndex + 1}`}
            onChange={(event) => update(index, { options: question.options.map((item, i) => i === optionIndex ? event.target.value : item) })} />
        </div>)}</div>
      </div>}
      <EditorField label="شرح الإجابة (اختياري)"><textarea className={`${field} resize-y leading-7`} maxLength={3000} rows={2} value={question.explanation || ''} placeholder="وضّح سبب صحة الإجابة؛ يظهر الشرح للطالب بعد تسليم الاختبار" onChange={(event) => update(index, { explanation: event.target.value })} /></EditorField>
    </section>)}
    <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-5">
      <button type="button" disabled={value.questions.length >= 200} className={editorButton} onClick={() => add(false)}><Plus className="h-4 w-4 text-blue-800" />سؤال اختيار من متعدد</button>
      <button type="button" disabled={value.questions.length >= 200} className={editorButton} onClick={() => add(true)}><Plus className="h-4 w-4 text-blue-800" />سؤال توصيل الإجابات</button>
    </div>
  </div>;
}
