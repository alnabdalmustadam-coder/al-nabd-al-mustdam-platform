'use client';

import { useState } from 'react';
import type { GradedQuizQuestion, StudentQuizAnswer, StudentQuizQuestion } from '@/lib/quizzes/model';

export function QuizQuestionInput({ question, answer, onChange }: {
  question: StudentQuizQuestion; answer?: StudentQuizAnswer; onChange: (answer: StudentQuizAnswer) => void;
}) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  if (question.type !== 'matching') return <div className="grid gap-2">
    {question.options.map((option, index) => <label key={index} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-xs font-bold sm:text-sm ${answer?.selectedIndex === index ? 'border-blue-600 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>
      <input type="radio" name={`answer-${question.id}`} value={index} checked={answer?.selectedIndex === index}
        onChange={() => onChange({ questionId: question.id, selectedIndex: index })} className="accent-blue-800" />{option}
    </label>)}
  </div>;
  const selections = answer?.selectedIndices || (question.prompts || []).map(() => -1);
  const assign = (promptIndex: number, optionIndex: number) => {
    if (!Number.isInteger(optionIndex) || optionIndex < -1 || optionIndex >= question.options.length) return;
    const next = selections.map((value) => value === optionIndex && optionIndex >= 0 ? -1 : value);
    next[promptIndex] = optionIndex;
    onChange({ questionId: question.id, selectedIndex: -1, selectedIndices: next });
    setSelectedOption(null);
  };
  return <div className="space-y-4">
    <p className="text-xs leading-6 text-slate-600">اسحب الإجابة إلى العبارة المناسبة، أو اختر إجابة ثم اضغط على عبارتها. يمكنك أيضاً استخدام قائمة الاختيار.</p>
    <div className="flex flex-wrap gap-2" role="group" aria-label="الإجابات المتاحة للتوصيل">
      {question.options.map((option, index) => <button key={index} type="button" draggable
        aria-pressed={selectedOption === index} onClick={() => setSelectedOption(selectedOption === index ? null : index)}
        onDragStart={(event) => { event.dataTransfer.setData('text/plain', `${question.id}:${index}`); event.dataTransfer.effectAllowed = 'move'; }}
        className={`min-h-11 cursor-grab rounded-xl border px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 ${selectedOption === index ? 'border-blue-700 bg-blue-800 text-white' : selections.includes(index) ? 'border-emerald-300 bg-emerald-50 text-emerald-900' : 'border-blue-200 bg-blue-50 text-blue-900'}`}>{option}</button>)}
    </div>
    <div className="space-y-3">
      {(question.prompts || []).map((prompt, index) => <div key={index} className="grid gap-2 rounded-xl border border-dashed border-blue-300 bg-slate-50 p-3 sm:grid-cols-2"
        onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}
        onDrop={(event) => { event.preventDefault(); const value = event.dataTransfer.getData('text/plain');
          const prefix = `${question.id}:`; if (value.startsWith(prefix)) assign(index, Number(value.slice(prefix.length))); }}>
        <button type="button" className="min-h-11 text-right text-xs font-bold leading-6 text-slate-800"
          aria-label={`توصيل الإجابة المختارة بالعبارة: ${prompt}`} onClick={() => { if (selectedOption !== null) assign(index, selectedOption); }}>{prompt}</button>
        <select aria-label={`إجابة: ${prompt}`} value={selections[index] ?? -1} onChange={(event) => assign(index, Number(event.target.value))}
          className="min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-bold text-slate-800">
          <option value={-1}>اختر الإجابة أو اسحبها هنا</option>
          {question.options.map((option, optionIndex) => <option key={optionIndex} value={optionIndex}>{option}</option>)}
        </select>
      </div>)}
    </div>
  </div>;
}

export function QuizQuestionReview({ question }: { question: GradedQuizQuestion }) {
  return <div className={`space-y-3 rounded-xl border p-4 ${question.isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/40'}`}>
    <h4 className="text-sm font-black leading-7 text-slate-900">{question.text}</h4>
    <p className={`text-xs font-bold ${question.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>{question.isCorrect ? 'إجابة صحيحة' : 'تحتاج مراجعة'}</p>
    {question.type === 'matching' ? (question.prompts || []).map((prompt, index) => <div key={index} className="rounded-lg bg-white p-3 text-xs leading-6 text-slate-700">
      <p className="font-bold">{prompt}</p>
      <p>إجابتك: {question.options[question.selectedIndices?.[index] ?? -1] || 'لم تتم الإجابة'}</p>
      <p className="font-bold text-emerald-800">الإجابة الصحيحة: {question.options[question.correctIndices?.[index] ?? -1]}</p>
    </div>) : <div className="space-y-1 text-xs leading-6 text-slate-700">
      <p>إجابتك: {question.options[question.selectedIndex ?? -1] || 'لم تتم الإجابة'}</p>
      <p className="font-bold text-emerald-800">الإجابة الصحيحة: {question.options[question.correctIndex]}</p>
    </div>}
    {question.explanation && <p className="rounded-lg bg-white p-3 text-xs leading-6 text-slate-600">{question.explanation}</p>}
  </div>;
}
