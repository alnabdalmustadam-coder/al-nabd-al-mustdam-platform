'use client';
import { Flag, Target, Sparkles } from 'lucide-react';
import type { LearningJourneySettings } from '@/types';
import { EditorCardHeading, EditorField, editorInput } from './editor-ui';

export function JourneySettingsEditor({ value, outcomes, onChange, onOutcomesChange }: { value: LearningJourneySettings; outcomes: string; onChange: (value: LearningJourneySettings) => void; onOutcomesChange: (value: string) => void }) {
  return <section data-editor-panel className="space-y-5 rounded-2xl border border-emerald-100 bg-white p-5 sm:p-7"><EditorCardHeading icon={Sparkles} title="رحلة التطوير المهني" description="ترحيب وأهداف، ثم اختبار قبلي ومحتوى تفاعلي واختبار بعدي ومراجعة الإكمال." />
    <EditorField icon={Flag} label="رسالة الترحيب" hint="تظهر في أول محطة. عند تركها فارغة يُستخدم وصف الدورة."><textarea maxLength={10000} rows={3} value={value.introduction} onChange={(event) => onChange({ ...value, introduction: event.target.value })} placeholder="رحّب بالطالب ووضّح ما سيقدمه له هذا المسار…" className={`${editorInput} leading-8`} /></EditorField>
    <EditorField icon={Target} label="أهداف التعلّم" hint="اكتب كل هدف في سطر مستقل؛ تظهر الأهداف كقائمة مرقمة للطالب."><textarea required maxLength={20000} rows={5} value={outcomes} onChange={(event) => onOutcomesChange(event.target.value)} placeholder="بنهاية الدورة سيكون الطالب قادرًا على…" className={`${editorInput} leading-8`} /></EditorField>
    <EditorField icon={Flag} label="ملخص ختام الرحلة"><textarea maxLength={10000} rows={3} value={value.summary} onChange={(event) => onChange({ ...value, summary: event.target.value })} placeholder="لخّص أهم ما تعلّمه الطالب والخطوة التالية…" className={`${editorInput} leading-8`} /></EditorField>
    <p className="rounded-xl bg-blue-50 p-4 text-xs leading-7 text-blue-900">جهّز الاختبار القبلي والبعدي من قسم «الاختبار». أكمل أهداف الرحلة ومحتواها واختباراتها قبل الحفظ والنشر.</p>
  </section>;
}
