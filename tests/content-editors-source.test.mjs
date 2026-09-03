import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

const editorPaths = ['admin', 'instructor'].flatMap(role =>
  ['courses', 'articles', 'services'].map(kind => `app/dashboard/${role}/${kind}/page.tsx`),
);
const readSource = async path => new TextDecoder('utf-8', { fatal: true }).decode(
  await readFile(new URL(`../${path}`, import.meta.url)),
);

test('content editors fill mobile viewports while retaining desktop dialog bounds', async () => {
  for (const path of editorPaths) {
    const source = await readSource(path);
    assert.match(source, /h-\[100dvh\]/, path);
    assert.match(source, /sm:h-auto/, path);
    assert.match(source, /sm:max-h-\[9[24]vh\]/, path);
    assert.match(source, /rounded-none/, path);
    assert.match(source, /sm:rounded-3xl/, path);
    assert.match(source, /useMobileDialogScrollLock\(isModalOpen/, path);
  }
});

test('course editor footers sit outside the mobile scrolling content', async () => {
  for (const role of ['admin', 'instructor']) {
    const source = await readSource(`app/dashboard/${role}/courses/page.tsx`);
    assert.match(source, /flex min-h-0 flex-1 flex-col overflow-hidden sm:block/);
    assert.match(source, /overflow-y-auto overscroll-contain p-4 sm:contents/);
    assert.match(source, /env\(safe-area-inset-bottom\)/);
    assert.doesNotMatch(source, /sticky bottom-0 z-20 -mx-4 -mb-4/);
  }
});

test('course card covers fill their slots at mobile and desktop breakpoints', async () => {
  const paths = [
    'components/ui/CourseCard.tsx',
    'app/dashboard/admin/courses/page.tsx',
    'app/dashboard/instructor/courses/page.tsx',
    'app/dashboard/student/courses/page.tsx',
    'app/dashboard/student/page.tsx',
    'app/dashboard/student/wishlist/page.tsx',
    'app/dashboard/student/pathways/page.tsx',
  ];
  for (const path of paths) {
    const source = await readSource(path);
    assert.match(source, /object-cover/, path);
    assert.doesNotMatch(source, /object-contain/, path);
    assert.match(source, /sizes="\(max-width:/, path);
  }
  for (const role of ['admin', 'instructor']) {
    for (const kind of ['articles', 'services']) {
      const source = await readSource(`app/dashboard/${role}/${kind}/page.tsx`);
      assert.match(source, /w-full h-full object-cover/);
      assert.doesNotMatch(source, /object-contain/);
    }
  }
});

test('image preview uses its whole slot and resets when a new cover is selected', async () => {
  const source = await readSource('components/dashboard/DeviceImageUploader.tsx');
  assert.match(source, /absolute inset-0 flex flex-col justify-between/);
  assert.match(source, /key=\{value\}/);
  assert.match(source, /aspect-video sm:aspect-16\/10/);
  assert.match(source, /className="object-cover"/);
  assert.match(source, /finally \{\s+if \(progressTimer\) clearInterval\(progressTimer\)/);
  const course = await readSource('app/dashboard/admin/courses/page.tsx');
  assert.equal((course.match(/label="صورة غلاف الدورة"/g) || []).length, 1);
  assert.doesNotMatch(course, /Thumbnail/);
});

test('editor-facing Arabic copy does not expose infrastructure provider names', async () => {
  for (const path of [...editorPaths, 'components/dashboard/DeviceImageUploader.tsx']) {
    const file = ts.createSourceFile(path, await readSource(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const inspect = node => {
      if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
        if (/[\u0600-\u06ff]/.test(node.text)) {
          assert.doesNotMatch(node.text, /supabase|supbase|bunny|bunystrim/i, path);
        }
      }
      ts.forEachChild(node, inspect);
    };
    inspect(file);
  }
});

test('mobile scroll lock restores existing styles and follows viewport changes', async () => {
  const source = await readSource('components/dashboard/useMobileDialogScrollLock.ts');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
  const effects = [];
  const listeners = new Set();
  const media = { matches: true, addEventListener: (_, fn) => listeners.add(fn), removeEventListener: (_, fn) => listeners.delete(fn) };
  const body = { style: { overflow: 'auto' } };
  const exports = {};
  vm.runInNewContext(outputText, {
    exports, require: name => {
      assert.equal(name, 'react');
      return { useEffect: callback => effects.push(callback) };
    },
    window: { matchMedia: query => { assert.equal(query, '(max-width: 639px)'); return media; } },
    document: { body },
  });
  exports.useMobileDialogScrollLock(true);
  const cleanup = effects.pop()();
  assert.equal(body.style.overflow, 'hidden');
  media.matches = false;
  for (const listener of listeners) listener();
  assert.equal(body.style.overflow, 'auto');
  media.matches = true;
  for (const listener of listeners) listener();
  assert.equal(body.style.overflow, 'hidden');
  cleanup();
  assert.equal(body.style.overflow, 'auto');
  assert.equal(listeners.size, 0);
  exports.useMobileDialogScrollLock(false);
  assert.equal(effects.pop()(), undefined);
});
