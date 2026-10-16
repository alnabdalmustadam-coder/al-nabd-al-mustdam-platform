'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { QuizData, QuizQuestion } from '@/types';
import type { StudentQuizAnswer, StudentQuizQuestion } from '@/lib/quizzes/model';
import { MatchingQuestion } from '@/components/quizzes/matching-question';

function MatchingPreview({ question }: { question: QuizQuestion }) {
  const [answer, setAnswer] = useState<StudentQuizAnswer>();
  const pairs = question.pairs || [];
  const valid = pairs.length >= 2 && pairs.every((pair) => pair.prompt.trim() && pair.answer.trim())
    && new Set(pairs.map((pair) => pair.answer.trim())).size === pairs.length;
  const preview = useMemo<StudentQuizQuestion>(() => ({ id: question.id, text: question.question, type: 'matching',
    prompts: (question.pairs || []).map((pair) => pair.prompt.trim()),
    options: (question.pairs || []).map((pair) => pair.answer.trim()).sort((a, b) => a.localeCompare(b, 'ar')) }), [question]);
  return <details className="rounded-xl border border-blue-200 bg-white p-3">
    <summary className="cursor-pointer text-xs font-black text-blue-900">معاينة شكل السؤال للطالب</summary>
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
  const field = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 placeholder:font-normal placeholder:text-slate-400 placeholder:opacity-100 focus:border-blue-600 focus:outline-none';
  return <div className="space-y-4" dir="rtl">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="space-y-1 text-xs font-bold text-slate-700">عنوان الاختبار
        <input className={field} value={value.title} maxLength={200} placeholder="مثال: اختبار المفاهيم الأساسية" onChange={(event) => onChange({ ...value, title: event.target.value })} />
      </label>
      <label className="space-y-1 text-xs font-bold text-slate-700">نسبة الاجتياز (%)
        <input type="number" min={0} max={100} className={field} value={value.passingScore ?? 70}
          onChange={(event) => onChange({ ...value, passingScore: Number(event.target.value) })} />
      </label>
    </div>
    {value.questions.map((question, index) => <section key={question.id} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2 text-xs font-black text-slate-700">
        <span>السؤال {index + 1} · {question.type === 'matching' ? 'توصيل الإجابات' : 'اختيار من متعدد'}</span>
        <button type="button" aria-label={`حذف السؤال ${index + 1}`} className="rounded-lg p-2 text-rose-600 hover:bg-rose-50"
          onClick={() => onChange({ ...value, questions: value.questions.filter((_, i) => i !== index) })}><Trash2 className="h-4 w-4" /></button>
      </div>
      <label className="block space-y-1 text-xs font-bold text-slate-700">نص السؤال
        <input required maxLength={2000} className={field} value={question.question}
          placeholder={question.type === 'matching' ? 'اكتب المطلوب توصيله، مثل: صِل كل مصطلح بتعريفه' : 'اكتب سؤالاً واضحاً، ثم أضف الاختيارات أدناه'}
          onChange={(event) => update(index, { question: event.target.value })} />
      </label>
      {question.type === 'matching' ? <div className="space-y-2">
        <p className="text-xs text-slate-600">اكتب كل عبارة وبجانبها الإجابة الصحيحة. ستظهر الإجابات للطالب بترتيب مستقل.</p>
        {(question.pairs || []).map((pair, pairIndex) => <div key={pair.id} className="flex items-start gap-2">
          <div className="grid flex-1 gap-2 sm:grid-cols-2">
            {(['prompt', 'answer'] as const).map((side) => <input key={side} required maxLength={500}
              aria-label={`${side === 'prompt' ? 'العبارة' : 'الإجابة'} ${pairIndex + 1} للسؤال ${index + 1}`}
              placeholder={side === 'prompt' ? `العبارة أو المصطلح ${pairIndex + 1}` : `الإجابة المطابقة للعبارة ${pairIndex + 1}`} className={field} value={pair[side]}
              onChange={(event) => update(index, { pairs: question.pairs?.map((item, i) => i === pairIndex ? { ...item, [side]: event.target.value } : item) })} />)}
          </div>
          {(question.pairs?.length || 0) > 2 && <button type="button" className="p-2 text-rose-600" aria-label={`حذف الزوج ${pairIndex + 1}`}
            onClick={() => update(index, { pairs: question.pairs?.filter((_, i) => i !== pairIndex) })}><Trash2 className="h-4 w-4" /></button>}
        </div>)}
        {(question.pairs?.length || 0) < 10 && <button type="button" className="rounded-lg px-3 py-2 text-xs font-bold text-blue-800 hover:bg-blue-50"
          onClick={() => update(index, { pairs: [...(question.pairs || []), { id: crypto.randomUUID(), prompt: '', answer: '' }] })}>+ إضافة زوج</button>}
        <MatchingPreview key={JSON.stringify(question.pairs)} question={question} />
      </div> : <div className="space-y-2">
        <p className="text-xs font-normal text-slate-500">أضف الاختيارات، وحدّد الإجابة الصحيحة من الدائرة بجانبها.</p>
        <div className="grid gap-2 sm:grid-cols-2">
        {question.options.map((option, optionIndex) => <label key={optionIndex} className="flex items-center gap-2">
          <input type="radio" aria-label={`الإجابة الصحيحة: الخيار ${optionIndex + 1} للسؤال ${index + 1}`} name={`${editorId}-correct-${question.id}`}
            checked={question.correctIndex === optionIndex} onChange={() => update(index, { correctIndex: optionIndex })} />
          <input required maxLength={500} aria-label={`الخيار ${optionIndex + 1} للسؤال ${index + 1}`} className={field} value={option} placeholder={`اكتب الاختيار ${optionIndex + 1}`}
            onChange={(event) => update(index, { options: question.options.map((item, i) => i === optionIndex ? event.target.value : item) })} />
        </label>)}
        </div>
      </div>}
      <label className="block space-y-1 text-xs font-bold text-slate-700">شرح الإجابة (اختياري)
        <textarea className={field} maxLength={3000} rows={2} value={question.explanation || ''} placeholder="وضّح سبب صحة الإجابة؛ يظهر الشرح للطالب بعد تسليم الاختبار" onChange={(event) => update(index, { explanation: event.target.value })} />
      </label>
    </section>)}
    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={value.questions.length >= 200} className="flex items-center gap-1 rounded-xl bg-blue-50 px-4 py-2 text-xs font-black text-blue-900 disabled:opacity-50" onClick={() => add(false)}><Plus className="h-4 w-4" />اختيار من متعدد</button>
      <button type="button" disabled={value.questions.length >= 200} className="flex items-center gap-1 rounded-xl bg-amber-50 px-4 py-2 text-xs font-black text-amber-900 disabled:opacity-50" onClick={() => add(true)}><Plus className="h-4 w-4" />توصيل الإجابات</button>
    </div>
  </div>;
}
