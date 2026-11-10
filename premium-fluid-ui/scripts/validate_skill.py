#!/usr/bin/env python3
"""Validate essential Agent Skills structure without nonstandard dependencies."""
import pathlib, re, sys
ROOT=pathlib.Path(__file__).resolve().parent.parent
p=ROOT/'SKILL.md'
assert p.is_file(), 'Missing SKILL.md'
s=p.read_text('utf8')
assert s.startswith('---\n'), 'YAML frontmatter must be first'
parts=s.split('\n---\n',1)
assert len(parts)==2, 'Unclosed YAML frontmatter'
header=parts[0][4:]
name=re.search(r'^name:\s*(.+)$',header,re.M)
desc=re.search(r'^description:\s*(.+)$',header,re.M)
assert name and desc, 'name/description required'
assert name.group(1)==ROOT.name, 'name must match skill folder'
assert re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',name.group(1)), 'invalid skill name'
assert len(name.group(1))<=64 and len(desc.group(1))<=1024, 'frontmatter too long'
refs=re.findall(r'\]\((references/[^)]+)\)',parts[1])
missing=[r for r in refs if not (ROOT/r).is_file()]
assert not missing, f'Missing references: {missing}'
assert len(s.splitlines())<500, 'SKILL.md is too long'
assert (ROOT/'assets/luxury-fluid-typography.css').is_file(), 'missing personal type tokens'
assert (ROOT/'assets/desktop-first-scale.css').is_file(), 'missing desktop-first two-tier scale css'
assert (ROOT/'scripts/responsive_audit.py').is_file(), 'browser audit absent'
assert (ROOT/'scripts/visual_compare.py').is_file(), 'paired before/after audit absent'
assert (ROOT/'scripts/static_css_audit.py').is_file(), 'static Tailwind/CSS audit absent'
assert (ROOT/'scripts/test_skill.py').is_file(), 'regression tests absent'
assert (ROOT/'scripts/component_audit.py').is_file(), 'component audit missing'
assert (ROOT/'scripts/interaction_smoke.py').is_file(), 'interaction smoke missing'
assert (ROOT/'scripts/component_geometry.js').is_file(), 'component geometry checks missing'
assert (ROOT/'references/component-level-qa.md').is_file(), 'component QA reference missing'
assert (ROOT/'assets/proportional-art-pattern.css').is_file(), 'proportional art example missing'
print(f'VALID {name.group(1)}: {len(refs)} on-demand links, {len(s.splitlines())} SKILL.md lines')
sys.exit(0)
