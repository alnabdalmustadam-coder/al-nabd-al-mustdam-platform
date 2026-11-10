#!/usr/bin/env python3
"""Minimal explicit, read-only-INTENT menu/popover interaction smoke test.

Only click NON-DESTRUCTIVE user-specified controls on a preview/test system.
Testing arbitrary live URLs requires --allow-live. No servers are launched.
This is not a complete keyboard, screen reader or E2E test.
"""
import argparse
import json
import sys
from pathlib import Path
from datetime import datetime,timezone

HERE=Path(__file__).resolve().parent.parent
FIXTURES={
 'healthy': HERE/'examples'/'interaction-healthy.html',
 'broken': HERE/'examples'/'interaction-broken.html',
}


def main():
    p=argparse.ArgumentParser(description=__doc__)
    g=p.add_mutually_exclusive_group(required=True)
    g.add_argument('--fixture',choices=sorted(FIXTURES))
    g.add_argument('--url')
    p.add_argument('--allow-live',action='store_true',help='Explicitly allow clicking a user-selected non-destructive control on the supplied URL')
    p.add_argument('--trigger',default='[data-pf-menu-trigger]')
    p.add_argument('--panel',default='[data-pf-menu-panel]')
    p.add_argument('--escape-closes',action='store_true',help='Require Escape to close panel')
    p.add_argument('--widths',default='360,390,768,1280',help='CSS viewport widths, comma-separated')
    p.add_argument('--out',type=Path,default=Path('interaction-audit'))
    p.add_argument('--timeout',type=int,default=8000)
    p.add_argument('--browser-executable')
    args=p.parse_args()
    if args.url and not args.allow_live:p.error('Use --allow-live to explicitly authorize interaction with the supplied site')
    try:
        widths=[int(w) for w in args.widths.split(',')]
        assert 1 <= len(widths) <= 20 and all(240 <= w <= 2000 for w in widths)
    except (ValueError,AssertionError):p.error('Invalid --widths')
    try:from playwright.sync_api import sync_playwright
    except ImportError:
        print('Playwright required',file=sys.stderr);return 1
    args.out.mkdir(parents=True,exist_ok=True)
    (args.out/'screenshots').mkdir(exist_ok=True)
    results=[]
    with sync_playwright() as pw:
        opts={'headless':True,'args':['--no-sandbox']}
        if args.browser_executable:opts['executable_path']=args.browser_executable
        try:browser=pw.chromium.launch(**opts)
        except Exception:
            if args.browser_executable or not Path('/usr/bin/chromium').exists():raise
            browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        try:
            for width in widths:
                page=browser.new_page(viewport={'width':width,'height':860},has_touch=width<=430)
                row={'width':width,'checks':{},'highFindings':[]}
                try:
                    if args.fixture:
                        page.set_content(FIXTURES[args.fixture].read_text('utf8'),wait_until='domcontentloaded')
                    else:page.goto(args.url,wait_until='domcontentloaded',timeout=args.timeout)
                    page.evaluate('document.fonts.ready')
                    trigger=page.locator(args.trigger)
                    panel=page.locator(args.panel)
                    if trigger.count()!=1 or panel.count()!=1:
                        raise ValueError('Trigger and panel selectors must each match exactly one element')
                    row['checks']['triggerVisible']=trigger.is_visible()
                    if not row['checks']['triggerVisible']:
                        row['highFindings'].append('Trigger is not visible');raise ValueError('Trigger not visible')
                    trigger.click(timeout=args.timeout)
                    try:panel.wait_for(state='visible',timeout=min(args.timeout,1500))
                    except Exception:pass
                    row['checks']['opensOnClick']=panel.is_visible()
                    if not row['checks']['opensOnClick']:
                        row['highFindings'].append('Panel did not open after trigger click')
                    if row['checks']['opensOnClick']:
                        try:page.screenshot(path=str(args.out/'screenshots'/f'{width}-open.png'),animations='disabled',timeout=args.timeout)
                        except Exception as exc:row['checks']['screenshotWarning']=str(exc)
                    if args.escape_closes and row['checks']['opensOnClick']:
                        page.keyboard.press('Escape');page.wait_for_timeout(180)
                        row['checks']['closesOnEscape']=not panel.is_visible()
                        if not row['checks']['closesOnEscape']:
                            row['highFindings'].append('Panel remained visible after Escape')
                except Exception as exc:
                    row['error']=str(exc)
                finally:page.close()
                results.append(row)
        finally:browser.close()
    errors=sum('error' in r for r in results)
    high=sum(len(r['highFindings']) for r in results)
    result={'tool':'premium-fluid-ui/interaction_smoke','version':'1.3.0',
      'timestampUTC':datetime.now(timezone.utc).isoformat(),
      'disclaimer':'Non-destructive UI smoke test only, not E2E, keyboard accessibility or real browser zoom.',
      'source':args.url or ('fixture:'+args.fixture),'summary':{'cases':len(results),'executionErrors':errors,'highFindings':high},
      'cases':results}
    (args.out/'results.json').write_text(json.dumps(result,indent=2,ensure_ascii=False),encoding='utf8')
    print(f'Interaction smoke: {len(results)} cases, high={high}, errors={errors}; evidence: {args.out.resolve()}')
    return 1 if errors else 2 if high else 0


if __name__=='__main__':raise SystemExit(main())
