// build-onepager.cjs — generates 2026-EX-Maturity-Strategy-onepager.docx
'use strict';
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, TableLayoutType,
  ShadingType, convertInchesToTwip, PageOrientation,
} = require(path.join(__dirname, '../../node_modules/docx'));

// ── Palette ─────────────────────────────────────────────────────────────────
const BRAND_BLUE   = '0077CC';
const PURPLE       = '6B47DC';
const GREEN        = '0B8043';
const DARK_TEXT    = '1A1A2E';
const BODY_GREY    = '444444';
const LIGHT_BG     = 'F0F4F8';
const WHITE        = 'FFFFFF';
const RULE_COLOUR  = 'DDDDDD';

// ── Helpers ──────────────────────────────────────────────────────────────────
const pt  = n => n * 20;
const noBorder = { style: BorderStyle.NONE, size: 0, color: 'auto' };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function heading(text, level = 1) {
  const sizes = { 1: 36, 2: 26, 3: 22 };
  const colors = { 1: BRAND_BLUE, 2: DARK_TEXT, 3: DARK_TEXT };
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: sizes[level], color: colors[level], font: 'Calibri' })],
    spacing: { before: level === 1 ? pt(6) : pt(10), after: pt(4) },
  });
}

function body(text, { bold = false, color = BODY_GREY, size = 20, before = 0, after = 4 } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold, size, color, font: 'Calibri' })],
    spacing: { before: pt(before), after: pt(after) },
  });
}

function bulletItem(label, detail) {
  const runs = [
    new TextRun({ text: label + ' ', bold: true, size: 20, color: DARK_TEXT, font: 'Calibri' }),
    new TextRun({ text: detail, size: 20, color: BODY_GREY, font: 'Calibri' }),
  ];
  return new Paragraph({
    bullet: { level: 0 },
    children: runs,
    spacing: { before: pt(1), after: pt(3) },
  });
}

function rule() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE_COLOUR } },
    spacing: { before: pt(8), after: pt(8) },
    children: [],
  });
}

function spacer(n = 4) {
  return new Paragraph({ children: [], spacing: { before: 0, after: pt(n) } });
}

function sectionLabel(text, color) {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 16, color, font: 'Calibri', allCaps: true })],
    spacing: { before: pt(8), after: pt(2) },
  });
}

// Three-column category table
function categoryTable() {
  const cols = [
    { label: 'LISTEN', color: BRAND_BLUE, items: [
      'Listen more than once a year (Pulse or 360)',
      'Capture feedback at key employee moments (Lifecycle)',
      'Get more actionable open-ended responses (Response Clarity or Adaptive Follow-Up)',
    ]},
    { label: 'UNDERSTAND', color: PURPLE, items: [
      'Unlock insights from open-ended feedback (Text iQ)',
      'Get results to the people who can act (Manager dashboards)',
      'Understand what scores actually mean (Benchmarks or Stats iQ)',
      'Let AI surface what matters (Qualtrics Assist, Comment Summaries, Insights Explorer)',
      'Connect data across programs (Employee Journey Analytics)',
    ]},
    { label: 'ACT', color: GREEN, items: [
      'Turn insights into concrete improvements (Action plans or Idea Boards)',
      'Automate follow-ups so nothing falls through (Workflows)',
    ]},
  ];

  const cellWidth = Math.round(9360 / 3); // spread across ~6.5 inches

  function makeCell(col) {
    const children = [
      new Paragraph({
        children: [new TextRun({ text: col.label, bold: true, size: 22, color: WHITE, font: 'Calibri' })],
        spacing: { before: pt(2), after: pt(4) },
      }),
      ...col.items.map(item =>
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: item, size: 18, color: WHITE, font: 'Calibri' })],
          spacing: { before: 0, after: pt(3) },
        })
      ),
    ];

    return new TableCell({
      children,
      shading: { type: ShadingType.SOLID, color: col.color },
      margins: { top: convertInchesToTwip(0.12), bottom: convertInchesToTwip(0.12), left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) },
      borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
      width: { size: cellWidth, type: WidthType.DXA },
    });
  }

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 9360, type: WidthType.DXA },
    rows: [
      new TableRow({ children: cols.map(makeCell) }),
    ],
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
  });
}

// Two-column "what / how" row
function twoColRow(left, right, bgLeft = LIGHT_BG, bgRight = WHITE) {
  function cell(text, bg, bold = false) {
    return new TableCell({
      children: [new Paragraph({
        children: [new TextRun({ text, bold, size: 19, color: BODY_GREY, font: 'Calibri' })],
        spacing: { before: pt(2), after: pt(2) },
      })],
      shading: { type: ShadingType.SOLID, color: bg },
      margins: { top: convertInchesToTwip(0.06), bottom: convertInchesToTwip(0.06), left: convertInchesToTwip(0.1), right: convertInchesToTwip(0.1) },
      borders: noBorders,
      width: { size: 4680, type: WidthType.DXA },
    });
  }
  return new TableRow({ children: [cell(left, bgLeft, true), cell(right, bgRight)] });
}

function twoColTable(rows) {
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: 9360, type: WidthType.DXA },
    rows: rows.map(([l, r], i) => twoColRow(l, r, i % 2 === 0 ? LIGHT_BG : 'F8F8F8', WHITE)),
    borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideH: noBorder, insideV: noBorder },
  });
}

// ── Document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: { run: { font: 'Calibri', size: 20, color: BODY_GREY } },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: convertInchesToTwip(0.75), bottom: convertInchesToTwip(0.75), left: convertInchesToTwip(0.9), right: convertInchesToTwip(0.9) },
      },
    },
    children: [

      // ── Title block ──────────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: '2026 EX Maturity Strategy', bold: true, size: 52, color: BRAND_BLUE, font: 'Calibri' })],
        spacing: { before: 0, after: pt(2) },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Program Growth + Guided Experiences  |  Internal Summary', size: 22, color: '888888', font: 'Calibri' })],
        spacing: { before: 0, after: pt(2) },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'March 2026  |  EX Product', size: 20, color: '888888', font: 'Calibri' })],
        spacing: { before: 0, after: pt(0) },
      }),
      rule(),

      // ── The problem ──────────────────────────────────────────────────────
      heading('The problem', 2),
      body('Most EX customers do not reach their program\'s potential. They run an annual survey, check a few charts, and wait until next year. Two barriers drive this:'),
      spacer(2),
      twoColTable([
        ['Awareness gap', 'Customers do not know what capabilities they are missing or what those capabilities would do for their program.'],
        ['Configuration gap', 'Even when customers are aware of a feature, setting it up requires navigating multiple screens without sufficient guidance.'],
      ]),
      spacer(),

      // ── The approach ─────────────────────────────────────────────────────
      heading('The approach', 2),
      body('A two-layer intervention addresses both barriers:'),
      spacer(2),
      bulletItem('Program Growth tab (shipped)', 'A permanent tab in the project navigation surfaces outcome-focused recommendations driven by the customer\'s actual account data. Each recommendation explains the business value and, where relevant, offers multiple paths so customers choose the approach that fits their program.'),
      bulletItem('Guided Experiences (to build)', 'For each recommended action, a structured in-product flow walks the customer through setup without requiring manual navigation. Built as extensions of the existing Guided Engagement Program (GEP) framework.'),
      spacer(),

      // ── Recommendations overview ─────────────────────────────────────────
      heading('11 recommendations across three categories', 2),
      body('Recommendations are organized to mirror the EX maturity framework. Customers see a maximum of five by default, with a "Show more" option.'),
      spacer(4),
      categoryTable(),
      spacer(),

      // ── Design principles ────────────────────────────────────────────────
      heading('Design principles', 2),
      spacer(2),
      bulletItem('Outcome-first.', 'Recommendations lead with the business goal, not the product feature.'),
      bulletItem('Personalized.', 'Copy references the customer\'s actual data: response counts, feature gaps, dashboard usage.'),
      bulletItem('Options, not mandates.', 'Where two features address the same goal (e.g., Pulse vs. 360), the customer sees both with context and chooses.'),
      bulletItem('Maturity scoring is internal.', 'The L1-L4 EX maturity model drives recommendation ranking. Customers never see a score or level.'),
      spacer(),

      rule(),

      // ── Roadmap ──────────────────────────────────────────────────────────
      heading('Roadmap', 2),
      spacer(2),
      twoColTable([
        ['Phase 1: Program Growth Tab', 'Complete. Recommendations surface in-product, grouped by Listen / Understand / Act. Account-state-driven logic determines which show.'],
        ['Phase 2: Priority Guided Experiences (Q3 2026)', 'Three high-impact guided flows: Text iQ setup, 360 project creation, benchmark builder.'],
        ['Phase 3: Extended Guided Experiences (Q4 2026 onward)', 'Remaining recommendations get guided flows & continuous improvements to existing flows.'],
      ]),
      spacer(),

      // ── Success metrics ──────────────────────────────────────────────────
      heading('How we measure success', 2),
      spacer(2),
      bulletItem('Primary.', 'Feature activation rate for recommended capabilities within 90 days of recommendation view.'),
      bulletItem('Secondary.', 'Guided experience completion rate; time-to-first-value for recommended features.'),
      bulletItem('Not the goal.', 'Impression counts or nudge views. Success is value realization, not message volume.'),
      spacer(),

      rule(),

      body('For full detail, see: 2026 EX Maturity Strategy (full document) and Program Growth: Maturity Framework Mapping.', { color: '888888', size: 18 }),
    ],
  }],
});

Packer.toBuffer(doc).then(buf => {
  const fs = require('fs');
  const out = path.join(__dirname, '..', '2026-EX-Maturity-Strategy-onepager.docx');
  fs.writeFileSync(out, buf);
  console.log('Written:', out);
});
ut);
});
