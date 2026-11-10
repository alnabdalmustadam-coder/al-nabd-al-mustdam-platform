#!/usr/bin/env python3
"""Fast built-in regression checks for Premium Fluid UI v1.4.0."""
import tempfile
import unittest
from pathlib import Path
from responsive_audit import cases
from static_css_audit import audit_file


class SkillTests(unittest.TestCase):
    def test_zoom_and_2d_viewport_matrix(self):
        quick = cases('quick')
        full = cases('full')
        self.assertTrue(any(c[3].startswith('125%') and c[4] == 1.25 for c in quick))
        # Verify 1024x600, mobile-landscape (740x360), and low-res (1366x768, 360x640, 320x568) are present
        dims_quick = {(c[0], c[1], c[2]) for c in quick}
        self.assertIn((1024, 600, 'compact-landscape-1024x600'), dims_quick)
        self.assertIn((740, 360, 'mobile-landscape'), dims_quick)
        self.assertIn((1366, 768, 'laptop-low-res'), dims_quick)
        self.assertIn((360, 640, 'mobile-low-res'), dims_quick)
        self.assertIn((320, 568, 'mobile-tiny'), dims_quick)
        self.assertEqual(len(quick), 12)
        self.assertTrue(all(c[0] >= 320 for c in quick))
        dims_full = {(c[0], c[1], c[2]) for c in full}
        self.assertIn((800, 480, 'low-res-landscape'), dims_full)
        self.assertIn((667, 375, 'mobile-landscape-small'), dims_full)
        self.assertIn((844, 390, 'mobile-landscape-modern'), dims_full)
        self.assertIn((1280, 720, 'low-res-desktop-720p'), dims_full)

    def test_tailwind_jsx_review(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp) / 'page.tsx'
            file.write_text(
                '''<div className="max-w-[1400px] w-[320px] w-80 grid-cols-2 lg:grid-cols-2 -mx-6 absolute h-screen whitespace-nowrap truncate">\n'''
                '''  <button style={{minWidth:'300px'}}>Go</button>\n</div>\n'''
            )
            kinds = {w['kind'] for w in audit_file(file)}
            self.assertIn('tailwind-arbitrary-fixed-dimension', kinds)
            self.assertIn('tailwind-standard-fixed-width', kinds)
            self.assertIn('tailwind-breakpoint-columns', kinds)
            self.assertIn('tailwind-unprefixed-multi-col-grid', kinds)
            self.assertIn('tailwind-negative-horizontal-margin', kinds)
            self.assertIn('tailwind-unconditional-absolute', kinds)
            self.assertIn('tailwind-rigid-h-screen-short-viewport-risk', kinds)
            self.assertIn('tailwind-nowrap', kinds)
            self.assertIn('tailwind-truncate', kinds)
            self.assertIn('jsx-inline-fixed-dimension', kinds)

    def test_relative_layout_not_flagged_as_large_fixed(self):
        with tempfile.TemporaryDirectory() as tmp:
            file = Path(tmp) / 'page.tsx'
            file.write_text('<section className="w-full max-w-full min-w-0 grid grid-cols-1 gap-4 static lg:absolute">ok</section>')
            self.assertFalse(audit_file(file))


if __name__ == '__main__':
    unittest.main(verbosity=2)
