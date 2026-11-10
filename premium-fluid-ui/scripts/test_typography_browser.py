#!/usr/bin/env python3
"""Validate computed CSS type tokens and reflow in a local file fixture.

Runs no dev server and writes no site files. This is not a genuine browser zoom test.
Requires Playwright + Chromium, optionally from the system PATH.
"""
from pathlib import Path
from shutil import which
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
HTML = (ROOT / 'examples/luxury-typography.html').read_text('utf8').replace(
    '<link rel="stylesheet" href="../assets/luxury-fluid-typography.css" />',
    '<style>' + (ROOT / 'assets/luxury-fluid-typography.css').read_text('utf8') + '</style>'
)
CASES = [320, 360, 390, 430, 768, 1280, 1440, 1920]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True, **({"executable_path": which("chromium")} if which("chromium") else {}))
    try:
        rows=[]
        for w in CASES:
            page=browser.new_page(viewport={"width":w,"height":900}, device_scale_factor=1)
            page.set_content(HTML, wait_until='load')
            actual=page.evaluate('''() => {
              const sz=s=>parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
              const rect=s=>document.querySelector(s).getBoundingClientRect();
              return { h1:sz('h1'), h2:sz('h2'), h3:sz('h3'),body:sz('.pf-type-body'),
                caption:sz('.pf-type-caption'),micro:sz('.pf-type-micro'),
                art:sz('.pf-fluid-art-title'), containerWidth:rect('.pf-fluid-art-shell').width,
                scroll:document.documentElement.scrollWidth, viewport:document.documentElement.clientWidth };
            }''')
            assert 32-.1 <= actual['h1'] <= 42.1, (w,actual)
            assert 22-.1 <= actual['h2'] <= 26.1, (w,actual)
            assert 18-.1 <= actual['h3'] <= 19.1, (w,actual)
            assert abs(actual['body']-15)<.1, (w,actual)
            assert abs(actual['caption']-13)<.1 and abs(actual['micro']-12)<.1, (w,actual)
            assert actual['scroll'] <= actual['viewport']+1, (w,actual)
            rows.append((w,actual))
            page.close()
        # Changing root size must enlarge type tokens; do not pin html font-size.
        page=browser.new_page(viewport={'width':390,'height':900})
        page.set_content(HTML)
        start=page.locator('.pf-type-body').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
        page.add_style_tag(content='html {font-size:125%}')
        enlarged=page.locator('.pf-type-body').first.evaluate('e=>parseFloat(getComputedStyle(e).fontSize)')
        assert abs(start-15)<.1 and abs(enlarged-18.75)<.1, (start,enlarged)
        page.close()
        for w,a in rows: print(f'{w:4} CSS px: H1 {a["h1"]:.1f}, H2 {a["h2"]:.1f}, H3 {a["h3"]:.1f}, body {a["body"]:.1f}, art {a["art"]:.1f}, overflow {a["scroll"]-a["viewport"]}')
        print(f'PASS: {len(rows)} viewport cases, root-font change 100% -> 125% ({start} -> {enlarged}), no page overflow.')
    finally:
        browser.close()
