#!/usr/bin/env python3
"""Validate sample UI interactions in Chromium; no project server or network."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

SCRIPT=Path(__file__).with_name('interaction_smoke.py')

class InteractionTests(unittest.TestCase):
    def test_menu_open_and_escape(self):
        with tempfile.TemporaryDirectory() as tmp:
            for fixture,exit_code,high in [('healthy',0,0),('broken',2,4)]:
                with self.subTest(fixture=fixture):
                    dest=Path(tmp)/fixture
                    proc=subprocess.run([sys.executable,str(SCRIPT),'--fixture',fixture,
                        '--escape-closes','--out',str(dest)],capture_output=True,text=True,timeout=120)
                    self.assertEqual(proc.returncode,exit_code,proc.stderr)
                    data=json.loads((dest/'results.json').read_text('utf8'))
                    self.assertEqual(data['summary']['cases'],4)
                    self.assertEqual(data['summary']['highFindings'],high)
                    self.assertEqual(data['summary']['executionErrors'],0)

if __name__=='__main__':unittest.main(verbosity=2)
