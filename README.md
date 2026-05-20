# EX Maturity Prototype

A clickable prototype of the **2026 EX Maturity strategy** for Qualtrics XM. It demonstrates how a personalized "Program Growth" experience can guide accounts toward their next best step without ever exposing the underlying maturity model.

Source-of-truth narrative:

- [One-pager](docs/2026-EX-Maturity-Strategy-onepager.docx)
- [Full strategy doc](docs/2026-EX-Maturity-Strategy.docx)
- [Program Growth maturity mapping](docs/program-growth-maturity-mapping.docx)
- [Intervention framework (PM doc)](docs/INTERVENTION_FRAMEWORK.md) — required fields, definition of done, and worked examples for proposing new interventions

## What it shows

The prototype has **two recommendation surfaces** with deliberately different roles:

- **Home page** — intentionally lean. Sidebar of recent projects plus one highly visible personalized nudge in the Growth section. The nudge is restricted to the listening-frequency family (Improve / Pulse / Biannual / Quarterly / Lifecycle) and rendered as a rich tier-aware carousel with a data widget and a "Personalized for you" tag. Most admins land here; very few will dig deeper unless we point them somewhere.
- **EX Growth tab** (in the hamburger menu) — three stacked sections: (1) **Program at a glance** overview metrics, (2) **Listening timeline** showing where each program (engagement, Pulse, lifecycle, 360) lands across the year, (3) **Recommended next steps** — the full **Listen / Understand / Act** framework as a 3-column grid. Comprehensive, lower density per card. The home's "See all recommendations" link routes here.

### Engagement vs Pulse

A load-bearing distinction in the framework:

- **Engagement** = the *comprehensive* listening program. Reaches all employees. The right move with strong response rates is to expand engagement frequency itself (annual → biannual → quarterly).
- **Pulse** = a *sampled monthly cadence*. Each month a small slice of the population (~5%) gets a short set of priority questions, rotated so everyone is heard over time. Pulse **supplements** engagement, not replaces it. At low response rates it fills the gap when full-population surveys aren't reaching enough people; at high response rates it adds a between-cycle finger-on-the-pulse layer.

Behind both surfaces, the recommendation engine in `src/data/maturityActions.ts`:

1. Derives a simulated `AccountState` from the user's projects (which programs exist, which features are enabled, response volumes, annual response rate).
2. Evaluates that state against the EX maturity framework (**Listen / Understand / Act**).
3. Emits outcome-focused `GrowthAction`s for the gaps, each surfaced under the **XM Advisor** badge.

The home picks its single nudge separately in `src/components/HomeListeningNudge.tsx`, tiering on `engagePulseResponseRate`. The two surfaces stay coordinated by reading the same `AccountState`.

The customer-facing copy never mentions maturity levels or numeric scores. Every recommendation reads as "here's what you'd unlock by doing X." That is a deliberate product principle, not just a writing style.

Clicking the Employee Engagement project in the sidebar drops into a project view with a setup checklist, to show what happens after the user follows a recommendation. The other sidebar projects are intentionally inert in this demo.

## Stack

- Vite + React 19 + TypeScript (strict)
- `lucide-react` icons, `recharts` available
- Plain CSS scoped through `src/styles/qualtrics.css` (the design system)
- No state library, no router; view switching is a `useState` in `App.tsx`
- Deployed on Vercel

## Running locally

```bash
npm install
npm run dev      # dev server
npm run build    # tsc -b && vite build → dist/  (what Vercel runs)
npm run lint
npm run preview
```

## Where things live

```
src/
  App.tsx                       Top-level shell, demo banner, hamburger nav (Home / EX Growth / Project)
  components/
    ProgramOverview.tsx         Home: project sidebar + Growth nudge. Intentionally lean.
    HomeListeningNudge.tsx      The home's rich, tier-aware listening-frequency card + carousel
    ProgramGrowthTab.tsx        EX Growth tab: stacks Program-at-a-glance metrics,
                                AnnualTimeline, and the Listen / Understand / Act grid
    AnnualTimeline.tsx          12-month calendar strip placing each survey on the year
    Header.tsx, ...
  data/
    maturityActions.ts          Recommendation engine (the brain of the demo). Exports
                                AccountState, deriveAccountState, generateGrowthActions.
    mockProjects.ts             Six fixture projects
    mockHeatmapData.ts, mock_comments.csv
  styles/qualtrics.css          All design tokens and component classes (xm-, prog-, pg-,
                                home-growth-, home-nudge- namespaces)
  types/index.ts                Project, GrowthAction, GrowthCategory, ...
  utils/insightGenerator.ts     Theme + sentiment math over mock_comments
docs/                           Strategy docs + scripts to regenerate them
  INTERVENTION_FRAMEWORK.md     PM framework for proposing new recommended interventions
  INTERVENTION_FRAMEWORK.docx
```

For operational guidance when editing the repo (conventions, build rules, what's safe vs. legacy code), see [CLAUDE.md](./CLAUDE.md).

## Demo banner

Every view renders a banner at the top linking to the Google Drive copies of the one-pager and strategy doc, with contact info for Noah Kalodner. It's the audience's primary path to context when they hit the demo cold, so leave it in place.

## Status

This is a UX prototype, not a working product. All data is static mock data. There is no API integration and there should not be one.
