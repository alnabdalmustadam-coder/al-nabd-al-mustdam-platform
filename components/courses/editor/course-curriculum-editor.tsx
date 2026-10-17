'use client';
import { useState, type Dispatch, type SetStateAction } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Clock3, FileText, HelpCircle, Layers, Loader2, Plus, Trash2, UploadCloud, Video } from 'lucide-react';
import type { EditorLesson, EditorSection } from '@/lib/courses/editor-model';
import { createCourseQuizDraft } from '@/lib/quizzes/course-quiz-draft';
import { CourseQuizEditor } from '@/components/quizzes/course-quiz-editor';
import { CourseFilesEditor, primaryDocumentFiles, type FilesUpdate } from './course-files-editor';
import { EditorField, EditorSectionHeading, editorButton, editorInput, editorPrimary } from './editor-ui';

type Props = { value: EditorSection[]; onChange: Dispatch<SetStateAction<EditorSection[]>>;
  onUploadVideo: (section: number, lesson?: number) => void;
  videoUpload: { secIdx: number; subIdx?: number } | null; videoProgress: number;
  onFileBusyChange: (busy: boolean) => void; disabled?: boolean;
};
export function CourseCurriculumEditor({ value, onChange, onUploadVideo, videoUpload, videoProgress, onFileBusyChange, disabled = false }: Props) {
  const [collapsed, setCollapsed] = useState(() => new Set(value.slice(1).map((section) => section.id)));
  const patchSection = (id: string, patch: Partial<EditorSection>) => onChange((current) => current.map((section) => section.id === id ? { ...section, ...patch } : section));
  const patchLesson = (id: string, lessonId: string, patch: Partial<EditorLesson>) => onChange((current) => current.map((section) => section.id === id
    ? { ...section, subItems: section.subItems.map((lesson) => lesson.id === lessonId ? { ...lesson, ...patch } : lesson) } : section));
  const updateFiles = (id: string, lessonId: string | null, update: FilesUpdate) => onChange((current) => current.map((section) => section.id !== id ? section
    : lessonId ? { ...section, subItems: section.subItems.map((lesson) => lesson.id === lessonId ? { ...lesson, attachments: update(lesson.attachments || []) } : lesson) }
      : { ...section, attachments: update(section.attachments || []) }));
  const addLesson = (id: string, type: EditorLesson['type']) => onChange((current) => current.map((section) => section.id === id ? { ...section,
    subItems: [...section.subItems, { id: `lesson-${crypto.randomUUID()}`, title: '', duration: '', videoUrl: '', type, isLocked: false,
      attachments: [], ...(type === 'quiz' ? { quizData: createCourseQuizDraft() } : {}) }] } : section));
  const addSection = () => {
    setCollapsed(new Set(value.map((section) => section.id)));
    onChange((current) => [...current, { id: `section-${crypto.randomUUID()}`, title: '', duration: '', videoUrl: '', type: 'video', isLocked: false, attachments: [],
      subItems: [{ id: `lesson-${crypto.randomUUID()}`, title: '', duration: '', videoUrl: '', type: 'video', isLocked: false, attachments: [] }] }]);
  };
  const busy = disabled || Boolean(videoUpload);
  return <div className="space-y-7">
    <EditorSectionHeading kind="curriculum" eyebrow="المحتوى التعليمي" title="الوحدات والدروس" description="قسّم الدورة إلى وحدات، ثم أضف الدروس وملفاتها. ملفات الوحدة متاحة داخل وحدتها، وملفات الدرس تظهر مع الدرس نفسه."
      action={<button type="button" onClick={addSection} disabled={busy} className={editorPrimary}><Plus className="h-4 w-4" />إضافة وحدة</button>} />
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600"><span className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-3 py-2.5 shadow-sm"><Layers aria-hidden="true" className="h-4 w-4 text-blue-700" /><strong className="font-semibold text-blue-950">{value.length}</strong> وحدات</span>
      <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2.5 shadow-sm"><BookOpen aria-hidden="true" className="h-4 w-4 text-emerald-700" /><strong className="font-semibold text-slate-900">{value.reduce((total, section) => total + section.subItems.length, 0)}</strong> دروس</span></div>
    <div className="space-y-6">{value.map((section, sectionIndex) => {
      const open = !collapsed.has(section.id);
      return <section key={section.id} data-editor-panel className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className={`flex items-center gap-3 bg-linear-to-l from-blue-50/70 via-white to-white px-5 py-4 sm:px-6 sm:py-5 ${open ? 'border-b border-slate-100' : ''}`}>
          <span className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border text-sm font-semibold ${open ? 'border-blue-800 bg-linear-to-br from-blue-600 to-blue-950 text-white shadow-[0_4px_10px_rgba(23,58,124,0.15)]' : 'border-blue-100 bg-blue-50 text-blue-700'}`}><Layers aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.6} /><span className="text-[10px] leading-none">{String(sectionIndex + 1).padStart(2, '0')}</span></span>
          <button type="button" disabled={busy} aria-expanded={open} aria-controls={`unit-${section.id}`} className="flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 text-right" onClick={() => setCollapsed((current) => { const next = new Set(current); if (next.has(section.id)) next.delete(section.id); else next.add(section.id); return next; })}>
            <span className="min-w-0"><span className="block truncate text-base font-semibold text-slate-900">{section.title || `الوحدة ${sectionIndex + 1}`}</span><span className="mt-1 block text-xs font-normal text-slate-400">{section.subItems.length} دروس · {section.attachments?.length || 0} ملفات للوحدة</span></span>
            {open ? <ChevronUp className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />}
          </button>
          {value.length > 1 && <button type="button" disabled={busy} aria-label={`حذف الوحدة ${sectionIndex + 1}`} onClick={() => onChange((current) => current.filter((item) => item.id !== section.id))}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
        </header>
        {open && <div id={`unit-${section.id}`} className="space-y-7 p-5 sm:p-6">
          <div className="grid gap-x-5 gap-y-5 sm:grid-cols-[minmax(0,1fr)_160px]">
            <EditorField icon={Layers} label="عنوان الوحدة"><input required value={section.title} onChange={(event) => patchSection(section.id, { title: event.target.value })} placeholder="مثال: مدخل إلى المفاهيم الأساسية" className={editorInput} /></EditorField>
            <EditorField icon={Clock3} label="مدة الوحدة"><input value={section.duration} onChange={(event) => patchSection(section.id, { duration: event.target.value })} placeholder="مثال: 45 دقيقة" className={editorInput} /></EditorField>
          </div>
          <button type="button" role="switch" aria-checked={!section.isLocked} onClick={() => patchSection(section.id, { isLocked: !section.isLocked })} className="flex min-h-11 items-center gap-3 rounded-xl px-1 text-xs text-slate-500">
            <span className={`relative block h-5 w-9 rounded-full transition-colors ${section.isLocked ? 'bg-slate-300' : 'bg-emerald-600'}`}><span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm ${section.isLocked ? 'right-0.5' : 'left-0.5'}`} /></span>
            المعاينة المجانية للوحدة <span className="font-semibold">{section.isLocked ? 'غير مفعّلة' : 'مفعّلة'}</span>
          </button>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
            <CourseFilesEditor title="ملفات الوحدة" description="مراجع وملخصات تخص هذه الوحدة بالكامل؛ يمكنك إضافة أكثر من ملف PDF أو Word أو PowerPoint." files={section.attachments || []} onChange={(update) => updateFiles(section.id, null, update)} onBusyChange={onFileBusyChange} />
            {section.fileUrl && (!section.legacySingle || section.subItems[0]?.type === 'video') && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs"><a href={section.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-800">{section.fileName || 'ملف الوحدة السابق'}</a><button type="button" disabled={busy} onClick={() => onChange((current) => current.map((item) => item.id === section.id ? { ...item, fileUrl: undefined, fileName: undefined, fileSize: undefined, subItems: item.legacySingle ? item.subItems.map((lesson) => ({ ...lesson, fileUrl: undefined, fileName: undefined, fileSize: undefined })) : item.subItems } : item))} className="min-h-10 px-3 text-rose-600">إزالة من الوحدة</button></div>}
          </div>
          <div className="space-y-5"><div className="flex items-center gap-2 border-t border-slate-100 pt-6"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50"><BookOpen aria-hidden="true" className="h-[18px] w-[18px] text-blue-800" /></span><h3 className="text-base font-semibold text-slate-900">دروس الوحدة</h3></div>
            {section.subItems.map((lesson, lessonIndex) => {
              const uploading = videoUpload?.secIdx === sectionIndex && videoUpload.subIdx === lessonIndex;
              const LessonIcon = lesson.type === 'quiz' ? HelpCircle : lesson.type === 'video' ? Video : FileText;
              return <article key={lesson.id} className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-[#fafbfd] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-semibold text-slate-600"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-800 shadow-sm"><LessonIcon aria-hidden="true" className="h-[18px] w-[18px]" strokeWidth={1.7} /></span><span className="rounded-md bg-blue-50 px-2 py-1 tabular-nums text-blue-800">{sectionIndex + 1}.{lessonIndex + 1}</span>{lesson.type === 'quiz' ? 'اختبار' : lesson.type === 'video' ? 'درس فيديو' : 'محتوى مكتوب'}</p>
                  {section.subItems.length > 1 && <button type="button" disabled={busy} aria-label={`حذف الدرس ${lessonIndex + 1} من الوحدة ${sectionIndex + 1}`} onClick={() => onChange((current) => current.map((item) => item.id === section.id ? { ...item, subItems: item.subItems.filter((entry) => entry.id !== lesson.id) } : item))} className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>}
                </div>
                <div className="grid gap-x-5 gap-y-5 sm:grid-cols-[minmax(0,1fr)_180px]"><EditorField icon={BookOpen} label="عنوان الدرس"><input required value={lesson.title} onChange={(event) => patchLesson(section.id, lesson.id, { title: event.target.value })} placeholder="اكتب عنوانًا يوضّح محتوى الدرس" className={editorInput} /></EditorField>
                  <EditorField icon={Layers} label="نوع المحتوى"><select aria-label="نوع الدرس" disabled={busy} value={lesson.type} className={editorInput} onChange={(event) => { const type = event.target.value as EditorLesson['type']; patchLesson(section.id, lesson.id, { type, ...(type === 'quiz' && !lesson.quizData ? { quizData: createCourseQuizDraft() } : {}) }); }}>
                    <option value="video">فيديو</option><option value="pdf">مستند PDF</option><option value="ppt">عرض PowerPoint</option><option value="doc">مستند Word</option><option value="quiz">اختبار</option>{lesson.type === 'article' && <option value="article">محتوى نصي</option>}
                  </select></EditorField>
                </div>
                {lesson.type === 'video' && <div className="space-y-4"><div className="grid items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><EditorField icon={Video} label="فيديو الدرس"><input value={lesson.videoUrl} dir="ltr" onChange={(event) => patchLesson(section.id, lesson.id, { videoUrl: event.target.value })} placeholder="رابط الفيديو أو معرّفه" className={`${editorInput} text-right`} /></EditorField>
                  <button type="button" disabled={busy} onClick={() => onUploadVideo(sectionIndex, lessonIndex)} className={`${editorButton} min-h-12`}>{uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}{uploading ? `جاري الرفع ${videoProgress}%` : 'رفع فيديو'}</button></div>
                  {uploading && <div role="progressbar" aria-label="رفع فيديو الدرس" aria-valuenow={videoProgress} aria-valuemin={0} aria-valuemax={100} className="h-2 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-blue-700 transition-all" style={{ width: `${videoProgress}%` }} /></div>}
                </div>}
                {['pdf', 'doc', 'ppt'].includes(lesson.type) && <CourseFilesEditor title="مستند الدرس الرئيسي" description="يظهر هذا الملف كمحتوى الدرس، ويمكن للطالب عرضه وتحميله." single files={primaryDocumentFiles(lesson)} onBusyChange={onFileBusyChange}
                  onChange={(update) => { onChange((current) => current.map((entry) => entry.id !== section.id ? entry : { ...entry, subItems: entry.subItems.map((item) => { if (item.id !== lesson.id) return item; const file = update(primaryDocumentFiles(item))[0]; return { ...item, fileUrl: file?.fileUrl, fileName: file?.title, fileSize: file?.fileSize, ...(file ? { type: file.fileType === 'ppt' ? 'ppt' as const : ['word', 'doc'].includes(file.fileType || '') ? 'doc' as const : 'pdf' as const } : {}) }; }) })); }} />}
                {lesson.type === 'quiz' && <CourseQuizEditor value={lesson.quizData || (section.legacySingle ? section.quizData : undefined) || { title: '', passingScore: 70, questions: [] }} onChange={(quizData) => patchLesson(section.id, lesson.id, { quizData })} />}
                <div className="max-w-[200px]"><EditorField icon={Clock3} label="مدة الدرس"><input value={lesson.duration} onChange={(event) => patchLesson(section.id, lesson.id, { duration: event.target.value })} placeholder="مثال: 10 دقائق" className={editorInput} /></EditorField></div>
                <div className="border-t border-slate-200 pt-5"><CourseFilesEditor title="ملفات إضافية لهذا الدرس" description="أرفق مراجع الدرس أو ورقة العمل أو شرائح الشرح. رفع الملفات هنا لا يغيّر نوع الدرس." files={lesson.attachments || []} onChange={(update) => updateFiles(section.id, lesson.id, update)} onBusyChange={onFileBusyChange} /></div>
              </article>;
            })}
          </div>
          {section.quizData && !(section.legacySingle && section.subItems[0]?.type === 'quiz') && <details className="rounded-2xl border border-slate-200 p-5"><summary className="cursor-pointer text-sm font-semibold text-slate-800">إعدادات اختبار الوحدة الحالي</summary><div className="pt-5"><CourseQuizEditor value={section.quizData} onChange={(quizData) => patchSection(section.id, { quizData })} /></div></details>}
          <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
            {([{ type: 'video', label: 'إضافة درس فيديو', Icon: Video }, { type: 'pdf', label: 'إضافة درس مستند', Icon: FileText }, { type: 'quiz', label: 'إضافة اختبار', Icon: HelpCircle }] as const).map(({ type, label, Icon }) => <button key={type} type="button" disabled={busy} onClick={() => addLesson(section.id, type)} className={editorButton}><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50"><Icon aria-hidden="true" className="h-4 w-4 text-blue-800" /></span>{label}</button>)}
          </div>
        </div>}
      </section>;
    })}</div>
    {!value.length && <button type="button" onClick={addSection} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-sm text-blue-900"><Plus className="h-5 w-5" />أضف أول وحدة في الدورة</button>}
  </div>;
}
