#!/usr/bin/env python3
"""Audit one real component at many *container* widths (v1.4.0).

Supports both isolated container-width sweeps (constant desktop viewport) and
--sync-viewport mode (scales the browser viewport alongside the card width and
tests short landscape heights like 600px/360px so @media queries and Tailwind
breakpoints trigger realistically).

Screenshot/JSON/HTML evidence. No dev servers are started. Exit 2 for high
findings, 1 for execution errors, 0 otherwise. Requires Playwright + Chromium.
"""
import argparse
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
JS = (Path(__file__).with_name('component_geometry.js')).read_text('utf8')
FIXTURES = {
    'healthy': HERE / 'examples' / 'component-healthy.html',
    'broken': HERE / 'examples' / 'component-broken.html',
    'clipped': HERE / 'examples' / 'component-clipped.html',
    'drift': HERE / 'examples' / 'component-drift.html',
}


def widths(value):
    try:
        parsed = [int(i.strip()) for i in value.split(',')]
        if not parsed or len(parsed) > 25 or any(x < 160 or x > 1800 for x in parsed):
            raise ValueError('widths must be 160..1800, at most 25')
        return list(dict.fromkeys(parsed))
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f'Invalid --widths: {exc}') from exc


def safe(text):
    return re.sub(r'[^a-zA-Z0-9_-]+', '-', text).strip('-')[:44] or 'component'


def launch(pw, executable):
    kw = {'headless': True, 'args': ['--no-sandbox']}
    if executable:
        kw['executable_path'] = executable
    try:
        return pw.chromium.launch(**kw)
    except Exception:
        if executable or not Path('/usr/bin/chromium').exists():
            raise
        return pw.chromium.launch(headless=True, args=['--no-sandbox'], executable_path='/usr/bin/chromium')


def compare_graphics(rows, threshold=.085):
    """Detect normalized geometry drift of opted-in vector-like visual artifacts."""
    baselines = {}
    baselines_component = {}
    for row in rows:
        if 'result' not in row:
            continue
        for graphic in row['result']['graphics']:
            key = graphic['name']
            baseline = baselines.setdefault(key, graphic)
            first_component_width = baselines_component.setdefault(key, row['result']['component']['width'])
            current_component_width = row['result']['component']['width']
            component_growth = abs(current_component_width / first_component_width - 1) if first_component_width else 0
            art_growth = abs(graphic['size']['w'] / baseline['size']['w'] - 1) if baseline['size']['w'] else 0
            if component_growth > .25 and art_growth < .06:
                row['result']['issues'].append({
                    'kind': 'fixed-art-inside-fluid-component',
                    'level': 'high',
                    'element': key,
                    'message': f'Component width changed {component_growth * 100:.1f}% but marked artwork changed only {art_growth * 100:.1f}%'
                })
            if graphic['size']['w'] < 40:
                continue
            delta = abs(graphic['aspect'] / max(baseline['aspect'], .001) - 1)
            if delta > threshold:
                row['result']['issues'].append({
                    'kind': 'proportional-aspect-drift',
                    'level': 'high',
                    'element': key,
                    'message': f'Visual artifact aspect ratio drifted {delta * 100:.1f}% across container widths'
                })
            partmap = {p['name']: p for p in baseline['parts']}
            for part in graphic['parts']:
                if part['name'] not in partmap:
                    continue
                previous = partmap[part['name']]
                for prop in ('x', 'y', 'w', 'h'):
                    drift = abs(part[prop] - previous[prop])
                    if drift > threshold:
                        row['result']['issues'].append({
                            'kind': 'proportional-part-drift',
                            'level': 'high',
                            'element': key,
                            'part': part['name'],
                            'message': f'{prop} position/size changed by {drift * 100:.1f}% of artwork width'
                        })
                        break


def report_html(rows, src):
    content = []
    for row in rows:
        vp = row.get('viewport', {})
        vp_str = f" (viewport {vp.get('width', '?')}×{vp.get('height', '?')})" if vp else ""
        title = html.escape(f"{row['requestedWidth']}px → actual {row.get('result', {}).get('component', {}).get('width', '?')}px{vp_str}")
        if row.get('error'):
            content.append(f'<article><h2>{title}</h2><p class="failure">{html.escape(row["error"])}</p></article>')
            continue
        issues = row['result']['issues']
        high = sum(x['level'] == 'high' for x in issues)
        li = ''.join('<li><strong>' + html.escape(x['kind']) + '</strong> ' + html.escape(x.get('message', '')) + '</li>' for x in issues[:50])
        screenshot = html.escape(row.get('screenshot', ''), quote=True)
        content.append(
            f'<article><h2>{title}</h2><p>{high} high / {len(issues) - high} review</p>'
            f'<a href="{screenshot}"><img src="{screenshot}" loading="lazy" alt="{title}"></a>'
            f'<details><summary>{len(issues)} findings</summary><ul>{li or "<li>None</li>"}</ul></details></article>'
        )
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Component width audit</title><style>
:root{font:16px system-ui;color:#18283a;background:#f2f5f8}*{box-sizing:border-box}
body{margin:auto;max-width:88rem;padding:1.25rem}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr));gap:1rem}
article{background:#fff;border:1px solid #d7dfea;border-radius:.8rem;padding:1rem;min-width:0}img{max-width:100%;height:auto;display:block;border:1px solid #eee}
li{margin:.5rem 0;overflow-wrap:anywhere}.failure{color:#a02020}
</style></head><body><h1>Component-Width QA (v1.4)</h1><p>Source: ''' + html.escape(src) + '''. Geometry findings are heuristics; review screenshots and intended decorative overlaps.</p><p>Opt-in <code>data-pf-proportional</code> / <code>data-pf-part</code> enables proportional-shape checks. Use <code>--sync-viewport</code> to also trigger @media / Tailwind breakpoints.</p><p><a href="results.json">JSON results</a></p><div class="grid">''' + ''.join(content) + '</div></body></html>'


def run(args):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('Missing playwright. pip install playwright && python -m playwright install chromium', file=sys.stderr)
        return 1
    source = FIXTURES[args.fixture].resolve().as_uri() if args.fixture else args.url
    args.out.mkdir(exist_ok=True, parents=True)
    (args.out / 'screenshots').mkdir(exist_ok=True)
    sync_vp = getattr(args, 'sync_viewport', False)
    rows = []
    with sync_playwright() as pw:
        try:
            browser = launch(pw, args.browser_executable)
        except Exception as exc:
            print(f'Chromium failed to launch: {exc}', file=sys.stderr)
            return 1
        try:
            for n, w in enumerate(args.widths, 1):
                if sync_vp:
                    vp_w = max(320, w + 32)
                    vp_h = 600 if vp_w >= 960 else (360 if vp_w in range(640, 860) else 800)
                else:
                    vp_w = max(1440, max(args.widths) + 180)
                    vp_h = 900
                page = browser.new_page(viewport={'width': vp_w, 'height': vp_h}, device_scale_factor=1)
                row = {'requestedWidth': w, 'selector': args.selector, 'viewport': {'width': vp_w, 'height': vp_h}}
                try:
                    (page.set_content(FIXTURES[args.fixture].read_text(encoding='utf-8'), wait_until='domcontentloaded', timeout=args.timeout)
                     if args.fixture else page.goto(source, wait_until='domcontentloaded', timeout=args.timeout))
                    if args.wait_for:
                        page.locator(args.wait_for).first.wait_for(state='visible', timeout=args.timeout)
                    target = page.locator(args.selector).first
                    target.wait_for(state='visible', timeout=args.timeout)
                    page.evaluate('document.fonts.ready')
                    if args.settle_ms:
                        page.wait_for_timeout(args.settle_ms)
                    target.evaluate('''(el, w) => {
                      el.style.setProperty('inline-size', w+'px', 'important');
                      el.style.setProperty('min-inline-size', '0', 'important');
                      el.style.setProperty('max-inline-size', 'none', 'important');
                      el.style.setProperty('flex', '0 0 auto', 'important');
                    }''', w)
                    page.wait_for_timeout(85)
                    if args.selector != args.selector.strip():
                        raise ValueError('Invalid surrounding selector whitespace')
                    matches = page.locator(args.selector).count()
                    if matches != 1:
                        raise ValueError(f'Selector matches {matches} elements; choose a unique --selector')
                    row['result'] = page.evaluate(JS, args.selector)
                    shot = f'screenshots/{n:02d}-{w}px.png'
                    try:
                        target.screenshot(path=str(args.out / shot), animations='disabled', timeout=args.timeout)
                    except Exception:
                        page.screenshot(path=str(args.out / shot), full_page=True, animations='disabled', timeout=args.timeout)
                    row['screenshot'] = shot
                except Exception as exc:
                    row['error'] = str(exc)
                finally:
                    page.close()
                rows.append(row)
        finally:
            browser.close()
    compare_graphics(rows)
    highs = sum(sum(i['level'] == 'high' for i in row.get('result', {}).get('issues', [])) for row in rows)
    errors = sum('error' in row for row in rows)
    summary = {
        'cases': len(rows),
        'executionErrors': errors,
        'highFindings': highs,
        'reviewFindings': sum(sum(i['level'] == 'review' for i in row.get('result', {}).get('issues', [])) for row in rows),
    }
    policy = 'synced viewport width/height to trigger @media breakpoints' if sync_vp else 'constant desktop viewport, change only component CSS inline-size; NOT browser zoom'
    result = {
        'tool': 'premium-fluid-ui/component_audit',
        'version': '1.4.0',
        'timestampUTC': datetime.now(timezone.utc).isoformat(),
        'source': source,
        'viewportPolicy': policy,
        'selector': args.selector,
        'summary': summary,
        'cases': rows,
    }
    (args.out / 'results.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf8')
    (args.out / 'index.html').write_text(report_html(rows, source), encoding='utf8')
    print(f'Component audit: {len(rows)} widths | high={highs} | review={summary["reviewFindings"]} | executionErrors={errors}')
    print(f'Evidence: {(args.out / "index.html").resolve()}')
    if errors:
        return 1
    return 2 if highs else 0


def main():
    p = argparse.ArgumentParser(description=__doc__)
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument('--url', help='Existing live URL; tool never starts a server')
    g.add_argument('--fixture', choices=sorted(FIXTURES), help='Bundled test scenario')
    p.add_argument('--selector', default='[data-pf-audit]', help='Unique component CSS selector')
    p.add_argument('--widths', type=widths, default=[240, 280, 320, 390, 480, 600], help='Comma separated widths 160..1800')
    p.add_argument('--sync-viewport', action='store_true', help='Scale browser viewport alongside component width to trigger @media / Tailwind breakpoints')
    p.add_argument('--out', type=Path, default=Path('component-audit'))
    p.add_argument('--wait-for', help='Optional visible CSS readiness selector')
    p.add_argument('--settle-ms', type=int, default=200)
    p.add_argument('--timeout', type=int, default=15000)
    p.add_argument('--browser-executable', help='Custom Chromium path')
    args = p.parse_args()
    if args.settle_ms < 0:
        p.error('--settle-ms must be nonnegative')
    return run(args)


if __name__ == '__main__':
    raise SystemExit(main())
