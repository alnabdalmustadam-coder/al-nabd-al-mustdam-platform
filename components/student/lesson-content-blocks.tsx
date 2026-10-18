'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Check, RotateCw } from 'lucide-react';
import type { LessonBlock } from '@/types';
import { isSafeContentImage } from '@/lib/learning/journey';
import styles from './professional-journey.module.css';

function ContentImage({ url, title }: { url?: string; title: string }) {
  return url && isSafeContentImage(url) ? <Image src={url} alt={title} width={1000} height={650} unoptimized className="mx-auto max-h-[420px] w-full rounded-2xl object-contain" /> : null;
}
function ContentBlock({ block, visit, visited }: { block: LessonBlock; visit: (id: string) => void; visited: Set<string> }) {
  const [active, setActive] = useState(0);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const items = block.items || [];
  if (block.type === 'text') return <section className="space-y-3">{block.title && <h3 className="text-lg font-semibold text-blue-950">{block.title}</h3>}<p className="whitespace-pre-wrap text-sm leading-8 text-slate-700 sm:text-base sm:leading-9">{block.text}</p></section>;
  if (block.type === 'image') return <figure className="space-y-3"><ContentImage url={block.imageUrl} title={block.title || ''} /><figcaption className="text-center text-xs leading-6 text-slate-500">{block.title}</figcaption></figure>;
  if (block.type === 'steps') return <section className="space-y-5">{block.title && <h3 className="text-lg font-semibold text-blue-950">{block.title}</h3>}<ol className="space-y-5">{items.map((item, index) => <li key={item.id} className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-semibold tabular-nums text-emerald-700">{index + 1}</span><div className="min-w-0 space-y-2 pt-1"><h4 className="text-sm font-semibold leading-7 text-slate-800">{item.title}</h4>{item.text && <p className="whitespace-pre-wrap text-sm leading-8 text-slate-600">{item.text}</p>}</div></li>)}</ol></section>;
  if (block.type === 'cards') return <section className="space-y-4">{block.title && <h3 className="text-lg font-semibold text-blue-950">{block.title}</h3>}<p className="text-xs leading-6 text-slate-500">اضغط على كل بطاقة لاكتشاف محتواها.</p><div className="grid gap-4 sm:grid-cols-2">{items.map((item) => {
    const open = flipped.has(item.id), key = `${block.id}:${item.id}`;
    return <button key={item.id} type="button" aria-expanded={open} aria-label={`${item.title} · ${open ? 'إظهار الوجه الأمامي' : 'عرض الشرح'}`} className={`${styles.flipCard} ${open ? styles.flipped : ''}`} onClick={() => { visit(key); setFlipped((current) => { const next = new Set(current); if (next.has(item.id)) next.delete(item.id); else next.add(item.id); return next; }); }}>
      <span className={styles.cardFaces}><span aria-hidden={open} className={styles.cardFront}><ContentImage url={item.imageUrl} title={item.title} /><strong>{item.title}</strong><span className="mt-auto inline-flex items-center gap-2 text-xs font-normal text-blue-100"><RotateCw className="h-4 w-4" />اكتشف المزيد{visited.has(key) && <Check className="h-4 w-4 text-emerald-300" />}</span></span><span aria-hidden={!open} className={styles.cardBack}><strong className="text-base">{item.title}</strong><span className="whitespace-pre-wrap text-sm font-normal leading-8">{item.text}</span></span></span>
    </button>;
  })}</div></section>;
  const selected = items[active];
  return <section className="space-y-4">{block.title && <h3 className="text-lg font-semibold text-blue-950">{block.title}</h3>}<div role="group" aria-label={block.title || 'أجزاء المحتوى'} className="flex flex-wrap gap-2">{items.map((item, index) => <button key={item.id} type="button" aria-pressed={active === index} onClick={() => { setActive(index); visit(`${block.id}:${item.id}`); }} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold ${active === index ? 'border-blue-900 bg-blue-900 text-white' : 'border-slate-200 bg-white text-slate-600'}`}><span className="tabular-nums">{index + 1}</span>{item.title}{visited.has(`${block.id}:${item.id}`) && <Check className="h-3.5 w-3.5 text-emerald-500" />}</button>)}</div>{selected && <div className="space-y-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 sm:p-7"><h4 className="font-semibold text-blue-950">{selected.title}</h4><ContentImage url={selected.imageUrl} title={selected.title} /><p className="whitespace-pre-wrap text-sm leading-8 text-slate-700">{selected.text}</p></div>}</section>;
}

export function LessonContentBlocks({ blocks, onReady }: { blocks: LessonBlock[]; onReady?: (ready: boolean) => void }) {
  const [visited, setVisited] = useState(() => new Set(blocks.filter((block) => block.type === 'tabs' && block.items?.length).map((block) => `${block.id}:${block.items![0].id}`)));
  const required = blocks.filter((block) => ['cards', 'tabs'].includes(block.type)).flatMap((block) => (block.items || []).map((item) => `${block.id}:${item.id}`));
  const ready = required.every((id) => visited.has(id));
  useEffect(() => { onReady?.(ready); }, [ready, onReady]);
  const visit = (id: string) => setVisited((current) => current.has(id) ? current : new Set([...current, id]));
  return <div className="space-y-8">{blocks.map((block) => <ContentBlock key={block.id} block={block} visit={visit} visited={visited} />)}{required.length > 0 && <p role="status" className="text-xs leading-6 text-slate-500">{ready ? 'اطّلعت على جميع الأجزاء التفاعلية.' : `اطّلعت على ${required.filter((id) => visited.has(id)).length} من ${required.length} أجزاء. افتح البطاقات والأقسام المتبقية للمتابعة.`}</p>}</div>;
}
