#!/usr/bin/env python3
"""Paired before/after browser evidence for the same responsive viewport matrix.

Captures two sources with identical viewport settings and stable screenshot timing.
Does NOT interpret pixel differences as UI quality, and proxy viewports are NOT real zoom.
No development server is started or stopped by this script.
"""
import argparse
import html
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

from responsive_audit import FIXTURES, JS_AUDIT, cases


def safe_name(value):
    return re.sub(r'[^a-z0-9_-]+', '-', value.lower()).strip('-')[:70]


def prepare(page, source, fixture, timeout_ms, settle_ms, wait_for, prime_scroll):
    if fixture:
        page.set_content(FIXTURES[fixture].read_text(encoding='utf-8'),
                         wait_until='domcontentloaded', timeout=timeout_ms)
        status = None
    else:
        response = page.goto(source, wait_until='domcontentloaded', timeout=timeout_ms)
        status = response.status if response else None
    if wait_for:
        page.locator(wait_for).first.wait_for(state='visible', timeout=timeout_ms)
    # Font loading & visible image decoding. Do not wait for networkidle: polling/live
    # auction pages may legitimately keep requests open indefinitely.
    page.evaluate("""async () => {
       await document.fonts.ready;
       await Promise.all([...document.images].filter(im=>im.complete && im.naturalWidth>0)
          .slice(0,100).map(im=>im.decode().catch(()=>{})));
    }""")
    if prime_scroll:
        page.evaluate("""async () => {
          const root = document.scrollingElement || document.documentElement;
          let pos=0, max=Math.min(root.scrollHeight-window.innerHeight, 12000);
          for (;pos<max;pos+=Math.max(250, Math.floor(window.innerHeight*.8))){
            window.scrollTo(0,pos);
            await new Promise(r=>setTimeout(r,65));
          }
          window.scrollTo(0,0);
        }""")
    if settle_ms:
        page.wait_for_timeout(settle_ms)
    return status


def launch_browser(pw, executable):
    opts={'headless':True, 'args':['--no-sandbox']}
    if executable:
        opts['executable_path']=executable
    try:
        return pw.chromium.launch(**opts)
    except Exception:
        if executable or not Path('/usr/bin/chromium').exists():
            raise
        opts['executable_path']='/usr/bin/chromium'
        return pw.chromium.launch(**opts)


def report_html(results, args):
    blocks=[]
    for r in results:
        title=html.escape(r['label']+' · '+str(r['viewport']['width'])+'×'+str(r['viewport']['height']))
        if 'error' in r:
            blocks.append(f'<section class="case"><h2>{title}</h2><p class="error">Failed: {html.escape(r["error"])}</p></section>')
            continue
        before=r['before']; after=r['after']
        def pane(label, x):
            findings=x['result']['issues']; high=sum(i['level']=='high' for i in findings)
            lines=''.join('<li>'+html.escape(i['kind']+' — '+i.get('element','')+' '+i['message'])+'</li>' for i in findings[:25])
            screenshot=html.escape(x['screenshot'],quote=True)
            return f'''<article class="pane"><h3>{label}</h3><p>{high} high / {len(findings)-high} review flags</p>
            <a href="{screenshot}" target="_blank"><img loading="lazy" src="{screenshot}" alt="{label} {title}"></a>
            <details><summary>Findings ({len(findings)})</summary><ul>{lines or '<li>No heuristic findings</li>'}</ul></details></article>'''
        blocks.append(f'<section class="case"><h2>{title}</h2><div class="pair">{pane("Before",before)}{pane("After",after)}</div></section>')
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Premium Fluid UI — visual comparison</title><style>
:root{font-family:system-ui,sans-serif;color:#192536;background:#f3f5f8}*{box-sizing:border-box}
body{max-width:100rem;margin:auto;padding:clamp(1rem,3vw,2rem)}h1{margin-bottom:.5rem}
.note{max-width:90ch;line-height:1.5}.case{background:white;border:1px solid #dce2eb;padding:clamp(1rem,2vw,1.5rem);border-radius:1rem;margin-block:1.25rem}
.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}.pane{min-width:0;overflow:hidden}
.pane img{display:block;width:100%;height:auto;border:1px solid #cbd5e1}.pane details{margin-block:1rem}
li{overflow-wrap:anywhere;margin-block:.4rem}.error{color:#a22626}
@media(max-width:50rem){.pair{grid-template-columns:minmax(0,1fr)}}
</style></head><body><h1>Before / After — Premium Fluid UI</h1>
<p class="note"><strong>Independent evidence:</strong> matching CSS viewport, viewport-reflow zoom PROXIES; not real browser zoom.
A visual difference alone does not establish improvement. Live/rotating data and animation states can differ between sources.
Review actual zoom (100/125/150/200%) and interactions manually. Check screenshot timing and project runtime state.
</p><p class="note"><a href="results.json">Download machine-readable evidence (results.json)</a></p>'''+ '\n'.join(blocks)+'</body></html>'


def main():
    p=argparse.ArgumentParser(description=__doc__)
    b=p.add_mutually_exclusive_group(required=True)
    b.add_argument('--before-url')
    b.add_argument('--before-fixture',choices=sorted(FIXTURES))
    a=p.add_mutually_exclusive_group(required=True)
    a.add_argument('--after-url')
    a.add_argument('--after-fixture',choices=sorted(FIXTURES))
    p.add_argument('--out',type=Path,default=Path('ui-before-after'))
    p.add_argument('--preset',choices=['quick','full'],default='quick')
    p.add_argument('--settle-ms',type=int,default=1500,
                   help='Additional time after fonts, media and optional selector settle (default 1500ms)')
    p.add_argument('--wait-for',help='CSS selector that must be visibly ready before each screenshot')
    p.add_argument('--prime-scroll',action='store_true',
                   help='Scroll down/up to trigger lazy images & scroll observers before screenshot')
    p.add_argument('--selector',help='Capture a specific component or section instead of full page')
    p.add_argument('--mask-selector',action='append',default=[],help='Mask unstable data like prices, clocks, carousel slides')
    p.add_argument('--timeout',type=int,default=20000)
    p.add_argument('--browser-executable',help='Optional Chromium executable')
    args=p.parse_args()
    if args.settle_ms<0 or args.timeout<1:
        p.error('settle-ms must be nonnegative, timeout positive')
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print('Install: python -m pip install playwright && python -m playwright install chromium',file=sys.stderr)
        return 1
    args.out.mkdir(parents=True,exist_ok=True)
    (args.out/'screenshots').mkdir(exist_ok=True)
    sides={'before':(args.before_url,args.before_fixture),'after':(args.after_url,args.after_fixture)}
    rows=[]
    try:
        with sync_playwright() as pw:
            browser=launch_browser(pw,args.browser_executable)
            for i,(width,height,kind,label,zoom) in enumerate(cases(args.preset),1):
                row={'label':label,'kind':kind,'viewport':{'width':width,'height':height},
                     'zoomReflowProxy':bool(zoom),'sourceBaseZoom':zoom}
                for side,(url,fixture) in sides.items():
                    page=browser.new_page(viewport={'width':width,'height':height},device_scale_factor=1,
                                          is_mobile=False,has_touch=(kind in ('mobile','tablet','tablet-portrait')))
                    try:
                        status=prepare(page,url,fixture,args.timeout,args.settle_ms,args.wait_for,args.prime_scroll)
                        result=page.evaluate(JS_AUDIT)
                        shot=f'screenshots/{i:02d}-{safe_name(kind)}-{width}x{height}-{side}.png'
                        opts={'path':str(args.out/shot),'animations':'disabled','timeout':args.timeout,
                              'mask':[page.locator(x) for x in args.mask_selector], 'mask_color':'#9AA8BC'}
                        if args.selector:
                            element=page.locator(args.selector).first
                            element.wait_for(state='visible',timeout=args.timeout)
                            element.screenshot(**opts)
                        else:
                            page.screenshot(full_page=True,**opts)
                        row[side]={'screenshot':shot,'httpStatus':status,'result':result}
                    except Exception as e:
                        row['error']=(row.get('error','')+' '+side+': '+str(e)).strip()
                    finally:
                        page.close()
                bval=row.get('before',{}).get('result',{}).get('issues',[])
                aval=row.get('after',{}).get('result',{}).get('issues',[])
                row['findingCounts']={'beforeHigh':sum(x['level']=='high' for x in bval),
                                       'afterHigh':sum(x['level']=='high' for x in aval)}
                print(f'{i:02d} {kind:20} {width}×{height} before={row["findingCounts"]["beforeHigh"]} after={row["findingCounts"]["afterHigh"]}'+(' ERROR' if 'error' in row else ''))
                rows.append(row)
            browser.close()
    except Exception as ex:
        print('Browser execution failed: '+str(ex),file=sys.stderr)
        return 1
    errors=sum('error' in r for r in rows)
    output={'tool':'premium-fluid-ui/visual_compare','version':'1.1.0',
            'timestampUTC':datetime.now(timezone.utc).isoformat(),
            'sources':{'before':args.before_url or f'fixture:{args.before_fixture}',
                       'after':args.after_url or f'fixture:{args.after_fixture}'},
            'matrix':args.preset,'settleMs':args.settle_ms,'waitFor':args.wait_for,
            'primeScroll':args.prime_scroll,'sectionSelector':args.selector,
            'maskedSelectors':args.mask_selector,
            'zoomDisclaimer':'Reflow proxy via CSS viewport reduction; NOT genuine browser zoom',
            'summary':{'cases':len(rows),'executionErrors':errors,
                       'beforeHigh':sum(r['findingCounts']['beforeHigh'] for r in rows),
                       'afterHigh':sum(r['findingCounts']['afterHigh'] for r in rows)},
            'cases':rows}
    (args.out/'results.json').write_text(json.dumps(output,ensure_ascii=False,indent=2),encoding='utf-8')
    (args.out/'index.html').write_text(report_html(rows,args),encoding='utf-8')
    print('Open '+str((args.out/'index.html').resolve()))
    print('Reminder: browser zoom is NOT genuinely simulated and visual change != quality improvement')
    return 1 if errors else 0  # findings need human/agent review; no automated acceptance claim


if __name__=='__main__':
    raise SystemExit(main())
