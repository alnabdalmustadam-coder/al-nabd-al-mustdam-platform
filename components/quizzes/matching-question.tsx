'use client';

import { useCallback, useId, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import { connectMatchingEndpoints, disconnectMatchingEndpoint, type MatchingEndpoint } from '@/lib/quizzes/matching';
import type { StudentQuizAnswer, StudentQuizQuestion } from '@/lib/quizzes/model';

type Point = { x: number; y: number };
type Geometry = { width: number; height: number; prompts: (Point | null)[]; options: (Point | null)[] };
type Gesture = { pointerId: number; source: MatchingEndpoint; startX: number; startY: number; moved: boolean };
type Drag = { source: MatchingEndpoint; point: Point; target: MatchingEndpoint | null };

const pairColors = ['#2563eb', '#0d9488', '#7c3aed', '#c2410c', '#be185d', '#0369a1', '#4d7c0f', '#a16207', '#4338ca', '#0f766e'];
const optionLabels = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح', 'ط', 'ي'];
const sameEndpoint = (a: MatchingEndpoint | null, b: MatchingEndpoint) => a?.side === b.side && a.index === b.index;

function connectionPath(start: Point, end: Point): string {
  const direction = start.x < end.x ? 1 : -1;
  const bend = Math.max(20, Math.abs(end.x - start.x) * 0.55);
  return `M ${start.x} ${start.y} C ${start.x + direction * bend} ${start.y}, ${end.x - direction * bend} ${end.y}, ${end.x} ${end.y}`;
}

export function MatchingQuestion({ question, answer, onChange }: {
  question: StudentQuizQuestion; answer?: StudentQuizAnswer; onChange: (answer: StudentQuizAnswer) => void;
}) {
  const helpId = useId();
  const boardRef = useRef<HTMLDivElement>(null);
  const promptRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);
  const [selected, setSelected] = useState<MatchingEndpoint | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [geometry, setGeometry] = useState<Geometry>({ width: 0, height: 0, prompts: [], options: [] });
  const prompts = question.prompts || [];
  const selections = prompts.map((_, index) => answer?.selectedIndices?.[index] ?? -1);
  const connectedCount = selections.filter((value) => value >= 0).length;

  const measure = useCallback(() => {
    const board = boardRef.current;
    if (!board) return;
    const bounds = board.getBoundingClientRect();
    const points = (nodes: (HTMLButtonElement | null)[], side: 'prompt' | 'option') => nodes.map((node) => {
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return { x: (side === 'prompt' ? rect.left : rect.right) - bounds.left, y: rect.top + rect.height / 2 - bounds.top };
    });
    const next = { width: bounds.width, height: bounds.height, prompts: points(promptRefs.current, 'prompt'), options: points(optionRefs.current, 'option') };
    setGeometry((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (boardRef.current) observer.observe(boardRef.current);
    [...promptRefs.current, ...optionRefs.current].forEach((node) => { if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [measure, question]);

  const emit = (next: number[], message: string) => {
    onChange({ questionId: question.id, selectedIndex: -1, selectedIndices: next });
    setSelected(null);
    setAnnouncement(message);
  };

  const connect = (source: MatchingEndpoint, target: MatchingEndpoint, toggle = false) => {
    const next = connectMatchingEndpoints(selections, question.options.length, source, target);
    if (!next) return;
    const promptIndex = source.side === 'prompt' ? source.index : target.index;
    if (toggle && selections[promptIndex] === next[promptIndex]) {
      emit(disconnectMatchingEndpoint(selections, { side: 'prompt', index: promptIndex }), `تم إلغاء توصيل السؤال ${promptIndex + 1}`);
    } else {
      emit(next, `تم توصيل ${prompts[promptIndex]} مع ${question.options[next[promptIndex]]}`);
    }
  };

  const choose = (event: MouseEvent<HTMLButtonElement>, endpoint: MatchingEndpoint) => {
    if (suppressClick.current && event.detail > 0) { suppressClick.current = false; return; }
    if (selected && selected.side !== endpoint.side) connect(selected, endpoint, true);
    else setSelected(sameEndpoint(selected, endpoint) ? null : endpoint);
  };

  const begin = (event: PointerEvent<HTMLButtonElement>, endpoint: MatchingEndpoint) => {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { pointerId: event.pointerId, source: endpoint, startX: event.clientX, startY: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const targetAt = (event: PointerEvent<HTMLButtonElement>): MatchingEndpoint | null => {
    const node = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-matching-side]');
    if (!node || !boardRef.current?.contains(node)) return null;
    const side = node.dataset.matchingSide;
    const index = Number(node.dataset.matchingIndex);
    if ((side !== 'prompt' && side !== 'option') || !Number.isInteger(index)) return null;
    return { side, index };
  };

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    const board = boardRef.current;
    if (!current || current.pointerId !== event.pointerId || !board) return;
    if (!current.moved && Math.hypot(event.clientX - current.startX, event.clientY - current.startY) < 6) return;
    current.moved = true;
    suppressClick.current = true;
    const bounds = board.getBoundingClientRect();
    const target = targetAt(event);
    setDrag({ source: current.source, point: {
      x: Math.max(0, Math.min(bounds.width, event.clientX - bounds.left)),
      y: Math.max(0, Math.min(bounds.height, event.clientY - bounds.top)),
    }, target: target?.side !== current.source.side ? target : null });
  };

  const finish = (event: PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!current || current.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.moved) {
      const target = targetAt(event);
      if (target) connect(current.source, target);
    }
  };

  const cancel = () => { gesture.current = null; setDrag(null); };
  const pointFor = (endpoint: MatchingEndpoint) => (endpoint.side === 'prompt' ? geometry.prompts : geometry.options)[endpoint.index];
  const startPoint = drag ? pointFor(drag.source) : null;

  const card = (text: string, endpoint: MatchingEndpoint) => {
    const promptIndex = endpoint.side === 'prompt' ? endpoint.index : selections.indexOf(endpoint.index);
    const isConnected = promptIndex >= 0 && selections[promptIndex] >= 0;
    const color = pairColors[Math.max(0, promptIndex) % pairColors.length];
    const active = sameEndpoint(drag?.source || selected, endpoint) || sameEndpoint(drag?.target || null, endpoint);
    const partner = isConnected ? (endpoint.side === 'prompt' ? question.options[selections[promptIndex]] : prompts[promptIndex]) : null;
    return <button key={endpoint.index} type="button" dir="rtl"
      ref={(node) => { (endpoint.side === 'prompt' ? promptRefs : optionRefs).current[endpoint.index] = node; }}
      data-matching-side={endpoint.side} data-matching-index={endpoint.index}
      aria-describedby={helpId} aria-pressed={active}
      aria-label={`${endpoint.side === 'prompt' ? 'السؤال' : 'الإجابة'} ${endpoint.index + 1}: ${text}${partner ? `، متصل مع ${partner}` : '، غير متصل'}`}
      onClick={(event) => choose(event, endpoint)} onPointerDown={(event) => begin(event, endpoint)}
      onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel}
      onKeyDown={(event) => {
        if (event.key === 'Escape') { cancel(); setSelected(null); }
        if ((event.key === 'Delete' || event.key === 'Backspace') && isConnected) {
          event.preventDefault(); emit(disconnectMatchingEndpoint(selections, endpoint), `تم إلغاء توصيل السؤال ${promptIndex + 1}`);
        }
      }}
      className={`relative flex min-h-20 w-full touch-pan-y select-none items-center gap-2 rounded-xl border-2 px-2.5 py-3 text-right text-xs font-bold leading-6 transition-[background-color,border-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:px-4 sm:text-sm ${active ? 'cursor-grabbing border-blue-700 bg-blue-50 shadow-[0_0_0_3px_#dbeafe]' : 'cursor-grab border-slate-200 bg-white text-slate-800 hover:border-blue-300'}`}
      style={!active && isConnected ? { borderColor: color, backgroundColor: `${color}0d` } : undefined}>
      <span aria-hidden="true" className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] leading-none text-slate-600"
        style={isConnected ? { color: 'white', backgroundColor: color } : undefined}>{isConnected ? promptIndex + 1 : endpoint.side === 'prompt' ? endpoint.index + 1 : optionLabels[endpoint.index]}</span>
      <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{text}</span>
      <span aria-hidden="true" className={`absolute top-1/2 flex h-10 w-10 -translate-y-1/2 touch-none items-center justify-center ${endpoint.side === 'prompt' ? '-left-5' : '-right-5'}`}>
        <span className="pointer-events-none h-4 w-4 rounded-full border-[3px] border-white shadow-sm"
          style={{ backgroundColor: active ? '#1d4ed8' : isConnected ? color : '#cbd5e1' }} />
      </span>
    </button>;
  };

  return <div className="space-y-3" dir="rtl">
    <p id={helpId} className="text-xs leading-6 text-slate-600">اسحب نقطة السؤال إلى نقطة الإجابة أو العكس. يمكنك أيضاً الضغط على الطرفين للتوصيل، وتكرار الضغط عليهما لإلغاء التوصيل.</p>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900">تم توصيل {connectedCount} من {prompts.length}</span>
      <button type="button" disabled={connectedCount === 0} className="rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600 underline decoration-slate-300 underline-offset-4 hover:text-blue-800 disabled:opacity-40"
        onClick={() => { cancel(); emit(prompts.map(() => -1), 'تم مسح جميع التوصيلات'); }}>مسح التوصيلات</button>
    </div>
    <div ref={boardRef} dir="ltr" className="relative isolate grid grid-cols-2 gap-x-10 sm:gap-x-20">
      {geometry.width > 0 && <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" viewBox={`0 0 ${geometry.width} ${geometry.height}`}>
        {selections.map((optionIndex, promptIndex) => {
          const start = geometry.prompts[promptIndex];
          const end = geometry.options[optionIndex];
          if (!start || !end) return null;
          return <path key={promptIndex} data-matching-connection={promptIndex} d={connectionPath(start, end)} fill="none" stroke={pairColors[promptIndex % pairColors.length]} strokeWidth={3} strokeLinecap="round" />;
        })}
        {drag && startPoint && <path d={connectionPath(startPoint, drag.point)} fill="none" stroke="#1d4ed8" strokeWidth={3} strokeDasharray="6 5" strokeLinecap="round" />}
      </svg>}
      <div className="relative z-10 min-w-0 space-y-3" role="group" aria-label="الإجابات">
        <p className="pb-1 text-center text-xs font-black text-slate-600" dir="rtl">الإجابات</p>
        {question.options.map((text, index) => card(text, { side: 'option', index }))}
      </div>
      <div className="relative z-10 min-w-0 space-y-3" role="group" aria-label="الأسئلة">
        <p className="pb-1 text-center text-xs font-black text-slate-600" dir="rtl">الأسئلة</p>
        {prompts.map((text, index) => card(text, { side: 'prompt', index }))}
      </div>
    </div>
    <p role="status" className="sr-only">{announcement}</p>
  </div>;
}
