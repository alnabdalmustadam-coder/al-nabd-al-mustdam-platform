#!/usr/bin/env python3
"""Regression: component-level analyzer must distinguish good and known-bad cases.

Uses bundled, self-contained HTML only. No network, dev server or repo mutation.
"""
import contextlib
import io
import tempfile
import unittest
from pathlib import Path
from component_audit import main as unused_main, run, widths, compare_graphics
from argparse import Namespace


class ComponentBrowserTests(unittest.TestCase):
    def test_widths_validation(self):
        self.assertEqual(widths('240,320,320,600'),[240,320,600])
        with self.assertRaises(Exception):widths('12,240')

    def test_proportional_art_drift_unit(self):
        def case(w,a):
            return {'result':{'component':{'width':w},'graphics':[{'name':'plate',
             'aspect':a/100,'size':{'w':a,'h':100},'parts':[]}],'issues':[]}}
        rows=[case(240,200),case(480,200)]
        compare_graphics(rows)
        self.assertTrue(any(x['kind']=='fixed-art-inside-fluid-component' for x in rows[-1]['result']['issues']))

    def test_browser_scenarios(self):
        try: import playwright.sync_api
        except ImportError:self.skipTest('Playwright not installed')
        expectations={'healthy':(0,set()),'broken':(2,{'text-text-overlap','fixed-art-inside-fluid-component'}),
                      'clipped':(2,{'clipped-text-inside-component'}),
                      'drift':(2,{'proportional-aspect-drift'})}
        import json
        with tempfile.TemporaryDirectory() as tmp:
            for fixture,(expected,required) in expectations.items():
                with self.subTest(fixture=fixture):
                    args=Namespace(fixture=fixture,url=None,selector='[data-pf-audit]',
                        widths=[240,390,600],out=Path(tmp)/fixture,
                        wait_for=None,settle_ms=0,timeout=15000,browser_executable=None)
                    with contextlib.redirect_stdout(io.StringIO()):exit_code=run(args)
                    self.assertEqual(exit_code,expected)
                    outcome=json.loads((args.out/'results.json').read_text('utf8'))
                    self.assertEqual(outcome['summary']['executionErrors'],0)
                    self.assertEqual(outcome['summary']['cases'],3)
                    types={i['kind'] for row in outcome['cases'] for i in row['result']['issues']}
                    self.assertTrue(required.issubset(types), (fixture,types))
                    self.assertTrue((args.out/'index.html').is_file())
                    self.assertEqual(len(list((args.out/'screenshots').glob('*.png'))),3)

if __name__=='__main__':unittest.main(verbosity=2)
