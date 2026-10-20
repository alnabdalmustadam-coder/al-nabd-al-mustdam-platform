'use client';
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Search } from 'lucide-react';

export type EditorSelectOption = { id: string; label: string };
type MenuPosition = { left: number; top: number; width: number; maxHeight: number; above: boolean };
type Props = { label: string; value: string; options: EditorSelectOption[]; onChange: (value: string) => void; disabled?: boolean; searchable?: boolean };

function menuPosition(trigger: HTMLElement, rows: number, searchable: boolean): MenuPosition {
  const rect = trigger.getBoundingClientRect();
  const viewport = window.visualViewport;
  const viewTop = viewport?.offsetTop || 0, viewLeft = viewport?.offsetLeft || 0;
  const viewBottom = viewTop + (viewport?.height || window.innerHeight);
  const viewRight = viewLeft + (viewport?.width || window.innerWidth);
  const belowTop = Math.max(viewTop + 12, rect.bottom + 8);
  const aboveBottom = Math.min(viewBottom - 12, rect.top - 8);
  const below = Math.max(0, viewBottom - belowTop - 12), aboveSpace = Math.max(0, aboveBottom - viewTop - 12);
  const desired = Math.min(320, Math.max(1, rows) * 48 + 16 + (searchable ? 59 : 0));
  const above = below < desired && aboveSpace > below;
  const width = Math.min(Math.max(rect.width, 220), viewRight - viewLeft - 24);
  return { width, left: Math.max(viewLeft + 12, Math.min(rect.right - width, viewRight - width - 12)),
    top: above ? aboveBottom : belowTop, above, maxHeight: Math.min(320, above ? aboveSpace : below) };
}

/** A select-only combobox, with an optional searchable list for long catalogs. */
export function EditorSelect({ label, value, options, onChange, disabled = false, searchable = false }: Props) {
  const id = useId(), listId = `${id}-options`;
  const trigger = useRef<HTMLButtonElement>(null), popup = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null), list = useRef<HTMLDivElement>(null);
  const typeahead = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false), [query, setQuery] = useState('');
  const [active, setActive] = useState(0), [position, setPosition] = useState<MenuPosition | null>(null);
  const [host, setHost] = useState<Element | null>(null);
  const unique = options.filter((option, index) => options.findIndex((item) => item.id === option.id) === index);
  const choices = value && !unique.some((option) => option.id === value) ? [{ id: value, label: value }, ...unique] : unique;
  const selected = choices.find((option) => option.id === value);
  const filtered = choices.filter((option) => option.label.toLocaleLowerCase('ar').includes(query.trim().toLocaleLowerCase('ar')));
  const activeId = filtered[active] ? `${listId}-${active}` : undefined;

  const close = (restore = false) => { setOpen(false); if (restore) trigger.current?.focus({ preventScroll: true }); };
  const show = (index = choices.findIndex((option) => option.id === value)) => {
    if (disabled || !trigger.current || trigger.current.matches(':disabled')) return;
    setQuery(''); setActive(Math.max(0, index));
    // Keep the menu inside the dialog's focus boundary, outside its scrolling form.
    setHost(trigger.current.closest('[role="dialog"]') || document.body);
    setPosition(menuPosition(trigger.current, choices.length, searchable)); setOpen(true);
  };
  const choose = (index: number) => { const option = filtered[index]; if (!option) return; onChange(option.id); close(true); };

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) setOpen(false);
    };
    const reposition = (event?: Event) => {
      if (!trigger.current || (event?.target instanceof Node && popup.current?.contains(event.target))) return;
      const rect = trigger.current.getBoundingClientRect();
      const view = window.visualViewport, top = view?.offsetTop || 0, bottom = top + (view?.height || window.innerHeight);
      // A mobile keyboard can cover the trigger while search is still in use.
      // Keep the popup inside the visible area; actual form scrolling still dismisses it.
      const focusedViewportChange = document.activeElement === search.current && (event?.target === view || event?.target === window);
      if ((rect.bottom < top || rect.top > bottom) && !focusedViewportChange) { setOpen(false); return; }
      setPosition(menuPosition(trigger.current, choices.length, searchable));
    };
    const frame = requestAnimationFrame(() => { if (searchable) search.current?.focus({ preventScroll: true }); });
    document.addEventListener('pointerdown', outside, true); document.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition); window.visualViewport?.addEventListener('resize', reposition); window.visualViewport?.addEventListener('scroll', reposition);
    return () => {
      cancelAnimationFrame(frame); document.removeEventListener('pointerdown', outside, true); document.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition); window.visualViewport?.removeEventListener('resize', reposition); window.visualViewport?.removeEventListener('scroll', reposition);
    };
  }, [open, choices.length, searchable]);

  useEffect(() => {
    if (!open) return;
    const option = list.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`), container = list.current;
    if (!option || !container) return;
    if (option.offsetTop < container.scrollTop) container.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > container.scrollTop + container.clientHeight) container.scrollTop = option.offsetTop + option.offsetHeight - container.clientHeight;
  }, [open, active, query]);

  const keydown = (event: KeyboardEvent) => {
    if (disabled) return;
    const key = event.key;
    if (key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); return; }
    if (key === 'Tab' && open) {
      if (searchable && event.target === search.current) {
        event.preventDefault(); event.stopPropagation();
        const scope = trigger.current?.closest('[role="dialog"]') || document.body;
        const controls = [...scope.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled):not([type="hidden"]),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]')]
          .filter((item) => item.getClientRects().length && !popup.current?.contains(item));
        const index = controls.indexOf(trigger.current!);
        controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length]?.focus();
      }
      close(); return;
    }
    if (event.target === search.current && (key === 'Home' || key === 'End')) return;
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      if (!open) { show(key === 'End' ? choices.length - 1 : key === 'Home' ? 0 : undefined); return; }
      if (!filtered.length) return;
      setActive(key === 'Home' ? 0 : key === 'End' ? filtered.length - 1 : (active + (key === 'ArrowDown' ? 1 : -1) + filtered.length) % filtered.length); return;
    }
    if (key === 'Enter' || (key === ' ' && event.target !== search.current)) {
      event.preventDefault(); if (open) choose(active); else show(); return;
    }
    if (event.target === search.current || key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey) return;
    const now = Date.now();
    const prefix = now - typeahead.current.time < 700 ? typeahead.current.text + key : key;
    typeahead.current = { text: prefix, time: now };
    const index = choices.findIndex((option) => option.label.toLocaleLowerCase('ar').startsWith(prefix.toLocaleLowerCase('ar')));
    if (index >= 0) { event.preventDefault(); if (open) setActive(index); else show(index); }
  };

  return <span className="block min-w-0" onKeyDown={keydown}>
    <button ref={trigger} type="button" role={searchable ? undefined : 'combobox'} disabled={disabled}
      aria-label={`${label}: ${selected?.label || 'اختر من القائمة'}`} aria-haspopup="listbox" aria-expanded={open}
      aria-controls={open ? listId : undefined} aria-activedescendant={!searchable && open ? activeId : undefined}
      onClick={() => open ? close() : show()}
      className={`flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2 text-right sm:min-h-12 sm:px-4 sm:py-3 text-base font-normal leading-6 text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.025)] outline-none transition-colors hover:border-blue-200 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm ${open ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200'}`}>
      <span className="min-w-0 flex-1 truncate">{selected?.label || 'اختر من القائمة'}</span><span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${open ? 'bg-blue-100 text-blue-700' : 'bg-blue-50 text-slate-500'}`}><ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${open ? 'rotate-180' : ''}`} /></span>
    </button>
    {open && host && position && createPortal(<div ref={popup} data-editor-select-popup dir="rtl"
      style={{ position: 'fixed', left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, transform: position.above ? 'translateY(-100%)' : undefined, zIndex: 150 }}
      className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white p-1.5 font-[family-name:var(--font-body)] text-slate-700 shadow-[0_12px_40px_-8px_rgba(23,58,124,0.24),0_2px_8px_rgba(23,58,124,0.06)]">
      {searchable && <div className="mb-1.5 flex shrink-0 items-center gap-2 border-b border-slate-100 px-3 pb-2.5 pt-1"><Search aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-600" /><input ref={search} role="combobox" aria-label={`البحث في ${label}`} aria-autocomplete="list" aria-expanded="true" aria-controls={listId} aria-activedescendant={activeId}
        value={query} onChange={(event) => { setQuery(event.target.value); setActive(0); }} placeholder={`ابحث في ${label}…`} className="min-h-10 w-full min-w-0 border-0 bg-transparent text-base font-normal outline-none placeholder:text-slate-400 sm:text-sm" /></div>}
      <div ref={list} id={listId} role="listbox" aria-label={label} className="relative min-h-0 overflow-y-auto overscroll-contain [scrollbar-color:#b8cae8_transparent] [scrollbar-width:thin]">
        {filtered.length ? filtered.map((option, index) => <div key={option.id} id={`${listId}-${index}`} role="option" aria-selected={option.id === value} data-option-index={index}
          onPointerMove={() => setActive(index)} onClick={() => choose(index)}
          className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm leading-7 ${option.id === value ? 'font-semibold text-blue-900' : 'font-normal text-slate-700'} ${index === active ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
          <span className="min-w-0 break-words">{option.label}</span><span className="h-4 w-4 shrink-0">{option.id === value && <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" strokeWidth={2.2} />}</span>
        </div>) : <p className="px-4 py-6 text-center text-sm text-slate-500">لا توجد نتائج مطابقة</p>}
      </div>
    </div>, host)}
  </span>;
}
