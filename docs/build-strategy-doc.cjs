const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  LevelFormat, PageNumber, Footer, Header, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

// ---- TOKENS ----
const PURPLE    = '6B47DC';
const BLUE      = '0077CC';
const GREEN     = '0B8043';
const ORANGE    = 'E07B00';
const GRAY_100  = 'F5F5F5';
const GRAY_200  = 'EEEEEE';
const GRAY_300  = 'E0E0E0';
const GRAY_600  = '757575';
const GRAY_800  = '424242';
const GRAY_900  = '212121';

const b  = (style) => ({ style, size: 4, color: GRAY_300 });
const tb = { top: b(BorderStyle.SINGLE), bottom: b(BorderStyle.SINGLE), left: b(BorderStyle.SINGLE), right: b(BorderStyle.SINGLE) };
const nb = { top: b(BorderStyle.NONE),   bottom: b(BorderStyle.NONE),   left: b(BorderStyle.NONE),   right: b(BorderStyle.NONE)   };
const pad = { top: 100, bottom: 100, left: 140, right: 140 };

// ---- HELPERS ----
function p(children, opts = {}) {
  return new Paragraph({ spacing: { before: 60, after: 80 }, ...opts, children });
}
function run(text, opts = {}) {
  return new TextRun({ text, font: 'Arial', size: 20, color: GRAY_800, ...opts });
}
function bold(text, color = GRAY_900, size = 20) {
  return new TextRun({ text, font: 'Arial', size, bold: true, color });
}
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 120 },
    children: [new TextRun({ text, font: 'Arial', size: 34, bold: true, color: GRAY_900 })]
  });
}
function h2(text, color = GRAY_900) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 80 },
    children: [new TextRun({ text, font: 'Arial', size: 26, bold: true, color })]
  });
}
function h3(text, color = GRAY_900) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 60 },
    children: [new TextRun({ text, font: 'Arial', size: 22, bold: true, color })]
  });
}
function body(text) {
  return p([run(text)]);
}
function bullets(items) {
  return items.map(item => {
    const children = typeof item === 'string'
      ? [run(item)]
      : [bold(item[0] + ' '), run(item[1])];
    return new Paragraph({
      numbering: { reference: 'bullets', level: 0 },
      spacing: { before: 40, after: 40 },
      children,
    });
  });
}
function spacer() { return new Paragraph({ spacing: { before: 80, after: 0 }, children: [] }); }
function rule()   {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_300 } },
    children: [],
  });
}

function callout(label, text, accentColor = PURPLE) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [200, 9160],
    rows: [new TableRow({ children: [
      new TableCell({
        borders: nb, margins: { top: 100, bottom: 100, left: 0, right: 0 },
        width: { size: 200, type: WidthType.DXA },
        shading: { fill: accentColor, type: ShadingType.CLEAR },
        children: [p([])]
      }),
      new TableCell({
        borders: { ...nb, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } },
        margins: { top: 100, bottom: 100, left: 200, right: 140 },
        width: { size: 9160, type: WidthType.DXA },
        shading: { fill: GRAY_100, type: ShadingType.CLEAR },
        children: [
          new Paragraph({ spacing: { before: 0, after: 60 }, children: [bold(label, accentColor, 18)] }),
          p([run(text)]),
        ]
      }),
    ]})],
  });
}

function twoColTable(headers, rows, colWidths = [2200, 3580, 3580]) {
  const hRow = new TableRow({ children: headers.map((h, i) =>
    new TableCell({
      borders: tb, margins: pad,
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { fill: PURPLE, type: ShadingType.CLEAR },
      children: [p([bold(h, 'FFFFFF', 18)])]
    })
  )});
  const dataRows = rows.map((row, ri) =>
    new TableRow({ children: row.map((cell, ci) =>
      new TableCell({
        borders: tb, margins: pad,
        width: { size: colWidths[ci], type: WidthType.DXA },
        shading: { fill: ri % 2 === 0 ? GRAY_100 : 'FFFFFF', type: ShadingType.CLEAR },
        children: [p(typeof cell === 'string' ? [run(cell)] : cell)]
      })
    )})
  );
  return new Table({
    width: { size: colWidths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [hRow, ...dataRows],
  });
}

// ---- BUILD ----
const doc = new Document({
  numbering: {
    config: [{
      reference: 'bullets',
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 440, hanging: 280 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 20, color: GRAY_800 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 34, bold: true, font: 'Arial', color: GRAY_900 },
        paragraph: { spacing: { before: 400, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: GRAY_900 },
        paragraph: { spacing: { before: 280, after: 80 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 22, bold: true, font: 'Arial', color: GRAY_900 },
        paragraph: { spacing: { before: 200, after: 60 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    headers: {
      default: new Header({ children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GRAY_300 } },
          spacing: { before: 0, after: 120 },
          children: [new TextRun({ text: '2026 EX Maturity Strategy | Internal Draft', font: 'Arial', size: 16, color: GRAY_600 })]
        })
      ]})
    },
    footers: {
      default: new Footer({ children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: GRAY_300 } },
          spacing: { before: 120, after: 0 },
          children: [
            new TextRun({ text: 'Page ', font: 'Arial', size: 16, color: GRAY_600 }),
            new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: GRAY_600 }),
          ]
        })
      ]})
    },
    children: [

      // ── COVER ──
      new Paragraph({ spacing: { before: 0, after: 60 }, children: [
        new TextRun({ text: '2026 EX Maturity Strategy', font: 'Arial', size: 56, bold: true, color: PURPLE })
      ]}),
      new Paragraph({ spacing: { before: 0, after: 40 }, children: [
        new TextRun({ text: 'L1 → L2+ Maturity Progression: Awareness & Configuration', font: 'Arial', size: 30, color: GRAY_900 })
      ]}),
      new Paragraph({ spacing: { before: 0, after: 360 }, children: [
        new TextRun({ text: 'Author: Noah Kalodner  ·  Date: February 2026  ·  Status: Draft for Review', font: 'Arial', size: 18, color: GRAY_600 })
      ]}),

      rule(),

      // ── EXECUTIVE SUMMARY ──
      h1('Executive Summary'),
      body('This document outlines the strategy to help EX customers progress from Level 1 (Basic EX program) to Level 2 and beyond (Continuous employee listening and meaningful insights). Based on UXR findings from the Q4\'25 Foundational Qualitative Study, the strategy addresses two distinct barriers that block maturity progression: an awareness gap and a configuration complexity gap.'),
      spacer(),
      body('The approach is built on two complementary layers:'),
      spacer(),
      ...bullets([
        ['Program Growth tab (shipped).', 'A dedicated tab in every EX project that surfaces personalized, outcome-focused recommendations based on where each customer currently is in their program. This is the awareness layer: it tells customers what to do next and why, without exposing internal scores or maturity levels.'],
        ['Per-action Guided Experiences (to be built).', 'A set of guided configuration flows, one per recommended action, that walk customers through setup step by step. This is the configuration layer. These extend the pattern established by the Guided Engagement Program (GEP) to post-launch maturity actions.'],
      ]),
      spacer(),
      body('Together, these layers address both barriers: customers first discover what would improve their program, then have a frictionless path to actually completing the setup.'),

      rule(),

      // ── STRATEGIC CONTEXT ──
      h1('Strategic Context'),
      body('The 2026 PLG vision positions Qualtrics to evolve beyond a toolkit into a proactive, guided, intelligent experience. For EX specifically, this means enabling admins to self-serve through in-product guidance and agentic assistance, reducing services reliance while increasing program maturity and retention.'),
      spacer(),
      h2('Two Barriers to Maturity Progression'),
      body('Previous maturity-focused efforts (tooltips, Pendo guides, feature announcements) addressed only the awareness gap. UXR findings indicate that awareness alone is insufficient. Low-maturity customers face two distinct barriers:'),
      spacer(),
      ...bullets([
        ['Awareness gap.', 'Users don\'t know certain features exist, or don\'t understand how those features could help their specific situation. Program growth messaging has made progress here, but has not been systematic or personalized to account state.'],
        ['Configuration complexity gap.', 'Even when users are aware of a feature, they perceive setup as too complex or time-consuming, leading to abandonment or workarounds, most commonly exporting to Excel for analysis that could be done in-platform.'],
      ]),
      spacer(),
      body('The 2026 strategy expands the intervention lens to address both. The Program Growth tab handles awareness systematically; Guided Experiences handle configuration complexity.'),
      spacer(),

      twoColTable(
        ['Dimension', 'Awareness Layer\n(Program Growth Tab)', 'Configuration Layer\n(Guided Experiences)'],
        [
          ['Barrier addressed', 'Awareness gap', 'Configuration complexity gap'],
          ['What it does', 'Surfaces personalized, outcome-focused recommendations based on account data', 'Guides users through setup step-by-step, automating where possible'],
          ['User effort', 'Discover the right next action with one click to expand details', 'Complete configuration through a structured flow, no manual navigation required'],
          ['Analogy', 'A coach telling you what to work on and why', 'A trainer doing the reps with you'],
          ['Status', 'Shipped (prototype complete)', 'To be built, one per recommendation'],
        ],
        [2200, 3580, 3580]
      ),

      spacer(),
      callout(
        'PLG Principle',
        '"When possible, we will do the work for the user rather than making it easier for the user to do on their own." Guided Experiences embody this principle: not tooltips that explain how to configure, but flows that complete configuration with the user.',
        PURPLE
      ),

      rule(),

      // ── KEY RESEARCH FINDINGS ──
      h1('Key Research Findings'),
      body('The following findings from the Q4\'25 Foundational Qualitative Study directly motivated this strategy:'),
      spacer(),
      ...bullets([
        'EX project admins report friction primarily with analysis and reporting configuration, driven by perceived platform complexity, not lack of awareness.',
        'Users export data to Excel and BI tools for analysis they believe cannot be done in-platform, even when equivalent features exist and are included in their license.',
        'Low utilization of AI features (Text iQ, benchmarks) despite no premium gates. Discoverability is part of the problem, but configuration complexity is the larger barrier.',
        'Managers struggle to interpret dashboards, driving admins to create custom reports externally rather than using in-platform sharing capabilities.',
        'When users do begin configuring advanced features, they frequently abandon partway through. Not because they don\'t want the feature, but because the setup path is unclear.',
      ]),

      rule(),

      // ── PROGRAM GROWTH TAB ──
      h1('The Awareness Layer: Program Growth Tab'),
      body('The Program Growth tab is a dedicated tab within each EX project. It surfaces outcome-focused recommendations personalized to the customer\'s current account state: what they\'re collecting, how they\'re analyzing it, and what they\'re doing with the results. The tab is driven by the internal L1–L4 EX maturity framework, but customers never see levels or scores. They see recommendations framed around the business outcome, not the feature.'),
      spacer(),

      h2('Design Principles'),
      ...bullets([
        ['Outcome-first language.', 'Recommendations lead with the business goal, not the product feature. "Listen to employees more than once a year" rather than "Set up a pulse survey."'],
        ['Personalized to account data.', 'Each recommendation references specific data from the customer\'s account. "You have 200 open-ended responses that aren\'t being analyzed yet", not generic copy.'],
        ['Options, not mandates.', 'Where multiple features can achieve the same outcome, the customer is shown option cards with context on each, so they can choose the path that fits their program, rather than being pushed to a single feature.'],
        ['Minimal surface area by default.', 'A maximum of 5 recommendations are shown by default, with a "Show more" toggle. Customers in L1–L2 see the most relevant gap-closing actions first.'],
        ['Invisible maturity scoring.', 'The L1–L4 framework is used internally to determine which recommendations surface and in what order. Customers are never shown a score or level.'],
      ]),
      spacer(),

      h2('Recommendation Categories'),
      body('Recommendations are organized into three categories, mirroring the maturity framework\'s Listen / Understand / Act structure:'),
      spacer(),

      twoColTable(
        ['Category', 'What it addresses', 'Example recommendations'],
        [
          ['Listen', 'Gaps in how the customer collects employee feedback', '"Listen to employees more than once a year" (Pulse or 360)\n"Capture feedback at key employee moments" (Lifecycle)\n"Get more actionable open-ended responses" (Response Clarity or Adaptive Follow-Up)'],
          ['Understand', 'Gaps in how the customer analyzes, visualizes, and shares results', '"Unlock insights from open-ended feedback" (Text iQ)\n"Get results into the hands of people who can act" (Manager dashboards)\n"Understand what your scores actually mean" (Benchmarks or Stats iQ)\n"Let AI help you find what matters" (Qualtrics Assist, Comment Summaries, Insights Explorer)'],
          ['Act', 'Gaps in how the customer converts insights into improvement', '"Turn insights into concrete improvements" (Action plans or Idea Boards)\n"Automate follow-ups so nothing falls through the cracks" (Workflows)'],
        ],
        [1400, 3480, 4480]
      ),
      spacer(),

      h2('Surfacing the Program Growth Tab'),
      body('The Program Growth tab is always accessible as a named tab in the project navigation. It does not require the customer to seek it out. The tab is present and labeled alongside Overview, Survey, Dashboards, and other standard tabs.'),
      spacer(),
      body('Additionally, the existing XM Advisor nudge pattern (a contextual banner that surfaces on relevant pages) can be used to actively direct customers to the Program Growth tab at key moments, such as on first dashboard view after survey close, or when a threshold of unanalyzed responses is detected. This gives customers a push without making the recommendations intrusive or unprompted on every page view.'),
      spacer(),

      h2('Internal Maturity Framework'),
      body('The recommendations are driven by a 4-level EX maturity model evaluated against real account telemetry. The model assesses signals across Listen, Understand, and Act dimensions: response counts, feature usage, dashboard views, workflow activity, and more, generating a prioritized set of growth actions for each account.'),
      spacer(),
      body('See supplemental document: Program Growth – Maturity Framework Mapping for a full mapping of all 11 customer-facing recommendations to their underlying framework measures and surfacing logic.'),

      rule(),

      // ── GUIDED EXPERIENCES ──
      h1('The Configuration Layer: Guided Experiences'),
      body('The Program Growth tab tells customers what to do. Guided Experiences help them actually do it. Each recommendation in the Program Growth tab will have a corresponding guided experience: a structured, step-by-step configuration flow that reduces the complexity of setup and, where possible, does the work on the customer\'s behalf.'),
      spacer(),

      h2('Relationship to the Guided Engagement Program'),
      body('The Guided Engagement Program (GEP), which reached GA in March 2026, established the pattern: guided flows for survey creation, participant import, communications, and dashboard generation that allow mid-market customers to launch an engagement program without services. GEP addresses the complexity of initial program launch.'),
      spacer(),
      body('Guided Experiences extend this pattern to post-launch maturity actions. Where GEP helps customers get started, Guided Experiences help customers grow. The underlying design principle is the same: replace complex, multi-step configuration with opinionated, step-by-step flows that result in a configured, value-generating capability.'),
      spacer(),
      callout(
        'GEP Connection',
        'Customers who completed GEP\'s guided dashboard creation will encounter a familiar interaction model when they enter a Guided Experience from the Program Growth tab. This consistency reduces cognitive load and builds trust in the guided flow pattern.',
        BLUE
      ),
      spacer(),

      h2('What a Guided Experience Is (and Is Not)'),
      ...bullets([
        ['It is NOT a tooltip or Pendo guide.', 'Those explain what to do. A Guided Experience completes the configuration.'],
        ['It is NOT a documentation link.', 'Customers should not need to leave the product to complete setup.'],
        ['It IS a structured flow.', 'Step-by-step, with smart defaults pre-populated based on the customer\'s survey type, org structure, and existing data.'],
        ['It DOES the work where possible.', 'For example: a one-click benchmark enablement that applies to all relevant widgets immediately, without requiring the customer to edit each widget manually.'],
      ]),
      spacer(),

      h2('Planned Guided Experiences'),
      body('Each of the following corresponds to a recommendation in the Program Growth tab. This is the initial set of experiences to be built, prioritized by L1/L2 maturity impact:'),
      spacer(),

      twoColTable(
        ['Recommendation', 'Guided Experience', 'Maturity Level'],
        [
          ['Unlock insights from open-ended feedback', 'Text iQ Setup Flow: steps through topic model selection, question mapping, and first analysis run. Defaults to EX25 theme taxonomy where applicable.', 'L2'],
          ['Get results into the hands of people who can act', 'Manager Dashboard Sharing Flow: configures confidentiality thresholds, filters results by org hierarchy, and generates manager-specific dashboard views.', 'L2'],
          ['Understand what your scores actually mean', 'Benchmark Enablement: one-click overlay that applies industry benchmarks to all relevant dashboard widgets. No manual widget editing required.', 'L2'],
          ['Listen to employees more than once a year', 'Pulse Project Creation: abbreviated project setup (pre-populated from the engagement survey template) with recommended cadence and question set.', 'L2'],
          ['Turn insights into concrete improvements', 'Action Plan Setup: guided creation of the first manager action plan, with suggested focus areas pre-populated from Text iQ themes.', 'L2'],
          ['Automate follow-ups so nothing falls through the cracks', 'Workflow Builder: pre-built workflow templates for common EX triggers (score drop alerts, participation nudges, thank-you messages).', 'L2'],
          ['Let AI help you find what matters', 'Qualtrics Assist Onboarding: guided first query experience that surfaces the most common questions for the customer\'s survey type and data.', 'L3'],
          ['Connect your data for a complete employee picture', 'Employee Journey Analytics Setup: guided data model creation connecting engagement and lifecycle data sources.', 'L3'],
        ],
        [2800, 5160, 1400]
      ),
      spacer(),

      h2('Entry Point from Program Growth'),
      body('Each recommendation in the Program Growth tab has a CTA button that launches the corresponding Guided Experience directly. Customers do not need to navigate to the feature independently. The tab serves as both the discovery surface and the entry point. This closes the loop between awareness and action within a single interaction.'),

      rule(),

      // ── IMPLEMENTATION ROADMAP ──
      h1('Implementation Roadmap'),

      h2('Phase 1: Program Growth Tab (Complete)'),
      body('The Program Growth tab has been prototyped and is ready for production instrumentation. Work required to move from prototype to production:'),
      ...bullets([
        'Connect account state evaluation to real telemetry (response counts, feature usage flags, dashboard view counts, workflow activity)',
        'Implement server-side recommendation generation to replace client-side mock data',
        'Add XM Advisor nudge trigger for directing customers to the tab at key moments',
        'Instrument click-through and CTA engagement for each recommendation',
      ]),
      spacer(),

      h2('Phase 2: Priority Guided Experiences (Q3 2026)'),
      body('The highest-impact configuration experiences, targeting the most common L1 → L2 gaps:'),
      ...bullets([
        'Text iQ Setup Flow (addresses the single largest analysis gap for customers with open-ended responses)',
        '360 Project Creation (extends GEP pattern to multi-rater listening expansion)',
        'Benchmark Builder (one-click enablement, lowest engineering complexity, high immediate impact)',
      ]),
      spacer(),

      h2('Phase 3: Extended Guided Experiences (Q4 2026+)'),
      body('Remaining recommendations get guided flows, with continuous improvements to existing flows as learnings accumulate:'),
      ...bullets([
        'Action Plan Setup and Workflow Builder (Act category)',
        'Manager Dashboard Sharing Flow and Pulse Project Creation',
        'Employee Journey Analytics Setup (for accounts with both engagement and lifecycle data)',
        'Comment Summaries and advanced AI feature enablement',
      ]),

      rule(),

      // ── SUCCESS METRICS ──
      h1('Success Metrics'),
      body('Metrics focus on configuration completion and value realization, not message views or feature clicks. This reflects the shift from awareness-based interventions to guided experiences that drive configured adoption.'),
      spacer(),

      twoColTable(
        ['Metric Category', 'Specific Measure', 'Target'],
        [
          ['Maturity Progression', 'L1 → L2 conversion rate', '+15% within 6 months of full deployment'],
          ['Awareness', 'Program Growth tab engagement rate (opened + recommendation expanded)', 'Establish baseline in Phase 1'],
          ['Configuration Completion', 'CTA click-through → Guided Experience completion rate', '>40% completion per experience'],
          ['Feature Adoption', 'Text iQ configured and generating insights', '25% increase from baseline'],
          ['Feature Adoption', 'Benchmark overlays enabled on dashboards', '25% increase from baseline'],
          ['Feature Adoption', 'Manager dashboards shared', '20% increase from baseline'],
          ['Business Impact', 'Churn rate for L1 customers', 'Reduction aligned with maturity progression'],
        ],
        [2200, 4160, 3000]
      ),

      rule(),

      // ── APPENDIX ──
      h1('Appendix'),
      h2('Related Documents'),
      ...bullets([
        'Program Growth – Maturity Framework Mapping: full mapping of all 11 recommendations to L1–L4 measures and surfacing logic',
        'Guided Engagement Program – FAQ: overview of GEP components, access, and design principles',
        'Text iQ Insight Surfacing Agent: original proof-of-concept documentation for the XM Advisor prototype',
        'Q4\'25 Foundational Qualitative Study: UXR findings driving this strategy',
      ]),
      spacer(),
      h2('Out of Scope'),
      body('The following items were considered and explicitly descoped from this strategy:'),
      ...bullets([
        ['Dashboard Builder Assistant.', 'Natural language widget creation within the dashboard canvas. Valuable, but addresses a different problem (ongoing dashboard customization) rather than the maturity progression gaps this strategy targets.'],
        ['Stakeholder Briefing Builder.', 'AI-generated executive presentation creation. Addresses a real admin pain point but requires significant presentation generation infrastructure. Candidate for a future standalone initiative.'],
        ['Discover interactions.', 'Removed from the maturity framework. No current product direction.'],
      ]),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  const out = path.join(__dirname, '2026-EX-Maturity-Strategy-updated.docx');
  fs.writeFileSync(out, buffer);
  console.log('Written:', out);
});
