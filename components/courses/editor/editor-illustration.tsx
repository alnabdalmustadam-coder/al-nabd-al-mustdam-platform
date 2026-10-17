'use client';
import { useId } from 'react';

export type EditorIllustrationKind = 'course' | 'curriculum' | 'files' | 'exam';

/** Small, decorative vector scenes; no image downloads or animation required. */
export function EditorIllustration({ kind = 'course', className = '' }: { kind?: EditorIllustrationKind; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return <svg viewBox="0 0 200 144" fill="none" aria-hidden="true" focusable="false" className={className}>
    <defs>
      <linearGradient id={`${id}-blue`} x1="56" y1="30" x2="156" y2="124" gradientUnits="userSpaceOnUse"><stop stopColor="#315bd0" /><stop offset="1" stopColor="#173a7c" /></linearGradient>
      <linearGradient id={`${id}-green`} x1="134" y1="16" x2="174" y2="70" gradientUnits="userSpaceOnUse"><stop stopColor="#33c4a0" /><stop offset="1" stopColor="#0b8b70" /></linearGradient>
    </defs>
    <ellipse cx="104" cy="132" rx="65" ry="6" fill="#173a7c" opacity=".06" />
    <circle cx="103" cy="73" r="60" fill="#edf3ff" />
    <circle cx="103" cy="73" r="48" stroke="#d6e3fc" strokeDasharray="3 5" />
    <path d="M22 72h16m-8-8v16m135 29h14m-7-7v14" stroke="#9fb7e5" strokeWidth="2" strokeLinecap="round" />
    <circle cx="170" cy="34" r="3" fill="#82d4bf" /><circle cx="43" cy="32" r="3" fill="#b8cbf1" />
    {kind === 'course' && <>
      <rect x="55" y="30" width="93" height="94" rx="14" fill="#d2dff7" transform="rotate(-9 55 30)" />
      <rect x="51" y="25" width="96" height="96" rx="14" fill={`url(#${id}-blue)`} />
      <path d="M70 53c10-4 19-3 29 3 10-6 19-7 29-3v42c-10-4-19-3-29 3-10-6-19-7-29-3V53Z" fill="white" fillOpacity=".96" />
      <path d="M99 57v40M79 64l11 3m-11 7 11 3m18-10 11-3m-11 13 11-3" stroke="#9bb5e4" strokeWidth="2" strokeLinecap="round" />
      <rect x="127" y="16" width="43" height="37" rx="12" fill={`url(#${id}-green)`} /><path d="m143 27 11 7-11 7V27Z" fill="white" />
      <rect x="31" y="99" width="49" height="25" rx="9" fill="white" stroke="#d7e3f6" /><circle cx="43" cy="111" r="4" fill="#1aaf8a" /><path d="M54 108h16m-16 6h11" stroke="#8aa3cb" strokeWidth="2" strokeLinecap="round" />
    </>}
    {kind === 'curriculum' && <>
      <path d="M71 47v58m0-39h37m-37 39h37" stroke="#b5c8eb" strokeWidth="3" strokeLinecap="round" />
      <rect x="48" y="21" width="107" height="35" rx="11" fill={`url(#${id}-blue)`} /><rect x="60" y="32" width="15" height="12" rx="3" fill="white" fillOpacity=".2" /><path d="M84 34h51m-51 9h33" stroke="white" strokeOpacity=".8" strokeWidth="2" strokeLinecap="round" />
      {[62, 101].map((y, index) => <g key={y}><rect x="94" y={y - 10} width="75" height="29" rx="9" fill="white" stroke="#cedcf3" /><rect x="102" y={y - 2} width="13" height="13" rx="4" fill={index ? '#e2f5ef' : '#e8effc'} /><path d={`M123 ${y + 1}h31m-31 6h20`} stroke="#8aa3cb" strokeWidth="2" strokeLinecap="round" /></g>)}
      <circle cx="53" cy="112" r="15" fill={`url(#${id}-green)`} /><path d="m47 112 4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>}
    {kind === 'files' && <>
      <rect x="57" y="25" width="83" height="91" rx="11" fill="#d1dff6" transform="rotate(-12 57 25)" />
      <path d="M63 19h56l22 23v66a11 11 0 0 1-11 11H63a11 11 0 0 1-11-11V30a11 11 0 0 1 11-11Z" fill="white" stroke="#c7d7f1" strokeWidth="1.5" /><path d="M119 19v18a5 5 0 0 0 5 5h17" fill="#edf3fd" stroke="#c7d7f1" strokeWidth="1.5" />
      <rect x="67" y="39" width="33" height="29" rx="8" fill={`url(#${id}-blue)`} /><path d="M76 60V48h8l7 6-7 6h-8Z" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M67 82h57M67 91h43M67 100h50" stroke="#b3c6e8" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="120" y="82" width="50" height="39" rx="12" fill={`url(#${id}-green)`} /><path d="M145 92v17m-6-6 6 6 6-6m-17 9h22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>}
    {kind === 'exam' && <>
      <rect x="53" y="29" width="91" height="94" rx="12" fill="#d8e4f8" transform="rotate(-8 53 29)" />
      <rect x="54" y="25" width="96" height="96" rx="12" fill="white" stroke="#c7d7f1" strokeWidth="1.5" /><rect x="78" y="16" width="48" height="19" rx="7" fill={`url(#${id}-blue)`} />
      {[53, 76, 99].map((y, index) => <g key={y}><rect x="68" y={y - 6} width="13" height="13" rx="4" fill={index === 2 ? '#e8effc' : '#e1f5ee'} />{index < 2 && <path d={`m71 ${y} 2 2 5-5`} stroke="#0e9c79" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}<path d={`M91 ${y - 2}h43m-43 7h28`} stroke="#b1c4e6" strokeWidth="2" strokeLinecap="round" /></g>)}
      <circle cx="153" cy="98" r="20" fill={`url(#${id}-green)`} /><path d="m143 98 7 7 12-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </>}
  </svg>;
}
