import sys
sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8', buffering=1)

EM = '\u2014'

with open('build-strategy-doc.cjs', encoding='utf-8') as f:
    src = f.read()

replacements = [
    ('2026 EX Maturity Strategy \u2014 Internal Draft',         '2026 EX Maturity Strategy | Internal Draft'),
    ('awareness layer \u2014 it tells',                         'awareness layer: it tells'),
    ('flows \u2014 one per recommended action \u2014 that walk','flows, one per recommended action, that walk'),
    ('agentic assistance \u2014 reducing',                       'agentic assistance, reducing'),
    ('feature announcements \u2014 addressed',                   'feature announcements) addressed'),
    ('efforts \u2014 tooltips',                                  'efforts (tooltips'),
    ('workarounds \u2014 most commonly, exporting',              'workarounds, most commonly exporting'),
    ('a structured flow \u2014 no manual navigation required',   'a structured flow, no manual navigation required'),
    ('To be built \u2014 one experience per recommendation',     'To be built, one per recommendation'),
    ('this principle \u2014 not tooltips',                       'this principle: not tooltips'),
    ('reporting configuration \u2014 driven by perceived',       'reporting configuration, driven by perceived'),
    ('abandon partway through \u2014 not because they',          'abandon partway through. Not because they'),
    ('current account state \u2014 what they',                   'current account state: what they'),
    ('once a year\\" \u2014 not \\"Set up',                      'once a year\\" rather than \\"Set up'),
    ('analyzed yet\\" \u2014 not generic copy',                  'analyzed yet\\", not generic copy'),
    ('context on each \u2014 so they can choose',                'context on each, so they can choose'),
    ('seek it out \u2014 the tab is present',                    'seek it out. The tab is present'),
    ('at key moments \u2014 for example, on first dashboard',    'at key moments, such as on first dashboard'),
    ('Act dimensions \u2014 response counts',                    'Act dimensions: response counts'),
    ('guided experience \u2014 a structured',                    'guided experience: a structured'),
    ('feature independently \u2014 the tab serves',              'feature independently. The tab serves'),
    ('Phase 1 \u2014 Program Growth Tab (Complete)',             'Phase 1: Program Growth Tab (Complete)'),
    ('Phase 2 \u2014 Priority Guided Experiences (Q2',           'Phase 2: Priority Guided Experiences (Q2'),
    ('Phase 3 \u2014 Extended Guided Experiences (Q4',           'Phase 3: Extended Guided Experiences (Q4'),
    ('one-click \u2014 lowest engineering',                      'one-click, lowest engineering'),
    ('value realization \u2014 not message views',               'value realization, not message views'),
    ('maturity framework \u2014 no current product direction',   'maturity framework. No current product direction'),
]

for frm, to in replacements:
    src = src.replace(frm, to)

remaining = src.count(EM)
print(f'Remaining em dashes: {remaining}')
if remaining:
    for i, line in enumerate(src.split('\n'), 1):
        if EM in line:
            print(f'  Line {i}: {line.strip()[:120]}')

with open('build-strategy-doc.cjs', 'w', encoding='utf-8') as f:
    f.write(src)
print('Done.')
