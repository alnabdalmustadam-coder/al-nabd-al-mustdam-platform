# Premium Fluid UI — تعليمات التثبيت والتشغيل (الإصدار v1.4.0)

**الإصدار الحالي: v1.4.0** — دعم كامل للتحويل الهيكلي (Structural Reflow)، شاشات `1024×600`، الشاشات ضعيفة الدقة (Low-Res)، الوضع الأفقي للموبايل والتابلت (Landscape)، وفحص الـ RTL على كامل طول الصفحة.

## الجديد في الإصدار v1.4.0 (حل جذري لمشاكل الشاشات الصغيرة والقصيرة)

1. **دعم شاشات `1024×600` والشاشات منخفضة الدقة (`1366×768`، `1280×720`، `800×480`، `360×640`، `320×568`):**
   - يعالج الفخ الشهير في شاشة `1024×600` (حيث يتفعل تصميم الديسكتوب `lg: 1024px` بينما الارتفاع `600px` فقط لا يكفي للـ Hero أو الكروت العائمة)، وذلك بربط التخطيطات الرأسية الكبيرة بشرط مزدوج للعرض والارتفاع معاً (`@media (min-width: 1024px) and (min-height: 680px)`) وتفعيل وضع مضغوط رأسياً عند `@media (max-height: 640px)`.
2. **دعم الوضع الأفقي للموبايل والتابلت (Mobile & Tablet Landscape):**
   - تمت إضافة مقاسات الوضع الأفقي للموبايل (`667×375`، `740×360`، `844×390`) والتابلت (`1024×768`، `1180×820`، `960×600`) إلى مصفوفة الفحص الآلي، مع قواعد لمنع استهلاك الهيدر والأيقونات العائمة لأكثر من `15%` من ارتفاع الشاشة القصيرة، ومنع استخدام `100vh` / `h-screen` الصارم الذي يقص الأزرار.
3. **إصلاح ثغرات فحص الـ RTL وكامل طول الصفحة في `responsive_audit.py`:**
   - يفحص السكربت الآن **الحافة اليسرى (`rect.left < -3`) والحافة اليمنى (`rect.right > vw + 3`) على كامل طول الصفحة من الهيدر حتى الفوتر** (وليس الجزء العلوي فقط).
   - يرصد قص النصوص العربية داخل الحاويات (`clipped-text-content`) وخروج النص عن الشاشة (`text-outside-viewport`) كمشكلة حرجة (`high`) تمنع قبول النتيجة حتى يتم إصلاحها.
   - يرصد تداخل البطاقات العائمة (`position: absolute`) وأيقونات الواتساب/المتجر (`position: fixed`) مع النصوص والأزرار والفوتر.
4. **قواعد التحويل الهيكلي الإلزامي (Structural Reflow) في `SKILL.md`:**
   - تلزم الـ Agent بعدم الاكتفاء بتصغير الأرقام عبر `clamp()` عندما تضيق الشاشة، بل تحويل البنية فعلياً: نقل أزرار الهيدر الثانوية إلى القائمة الجانبية تحت `900px`، تحويل الكروت العائمة `absolute` إلى `static` تحت `1024px` أو عند ارتفاع أقل من `680px`، وتحويل الشبكات `grid-cols-2` إلى `grid-cols-1` على الموبايل.
5. **ترقية الفاحص الثابت `static_css_audit.py` وفاحص المكونات `component_audit.py`:**
   - يكتشف الفاحص الثابت الآن العروض الثابتة بدءاً من `260px`، وكلاسات Tailwind القياسية (`w-64`, `w-72`, `w-80`, `w-96`)، والشبكات غير المسبوقة بـ `grid-cols-1` على الموبايل (`grid-cols-2`)، والهوامش السالبة (`-mx-*`)، وكلاس `absolute` غير المشروط، و`h-screen`.
   - يدعم `component_audit.py` الخيار `--sync-viewport` لتغيير عرض وارتفاع نافذة المتصفح مع الكارت حتى تتفعل قواعد `@media` وكلاسات Tailwind أثناء الفحص.

## التثبيت السريع

1. فك الضغط عن الملف؛ سينتج مجلد `premium-fluid-ui` وبداخله `SKILL.md` وكافة السكربتات والمراجع.
2. انسخ المجلد كاملاً إلى `<project>/.agents/skills/premium-fluid-ui/` داخل مشروعك (أو في المسار العام `~/.gemini/config/skills/premium-fluid-ui/` لـ Antigravity و`~/.agents/skills/premium-fluid-ui/` لـ Codex).

## أوامر التشغيل والفحص

```bash
python scripts/validate_skill.py
python scripts/test_skill.py
python scripts/responsive_audit.py --url http://localhost:3000 --out ./ui-audit --preset quick
python scripts/responsive_audit.py --url http://localhost:3000 --out ./ui-audit-full --preset full
python scripts/component_audit.py --url http://localhost:3000 --selector '.auction-card' --sync-viewport --out ./component-audit
python scripts/static_css_audit.py /path/to/your/project
```
