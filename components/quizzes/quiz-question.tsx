'use client';

import { MatchingQuestion } from '@/components/quizzes/matching-question';
import type { GradedQuizQuestion, StudentQuizAnswer, StudentQuizQuestion } from '@/lib/quizzes/model';

export function QuizQuestionInput({ question, answer, onChange }: {
  question: StudentQuizQuestion; answer?: StudentQuizAnswer; onChange: (answer: StudentQuizAnswer) => void;
}) {
  if (question.type === 'matching') return <MatchingQuestion key={question.id} question={question} answer={answer} onChange={onChange} />;
  return <div className="grid gap-2">
    {question.options.map((option, index) => <label key={index} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-xs font-bold sm:text-sm ${answer?.selectedIndex === index ? 'border-blue-600 bg-blue-50 text-blue-950' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300'}`}>
      <input type="radio" name={`answer-${question.id}`} value={index} checked={answer?.selectedIndex === index}
        onChange={() => onChange({ questionId: question.id, selectedIndex: index })} className="accent-blue-800" />{option}
    </label>)}
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
