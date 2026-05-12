# EX Maturity Prototype

A clickable prototype of the **2026 EX Maturity strategy** for Qualtrics XM. It demonstrates how a personalized "Program Growth" experience can guide accounts toward their next best step without ever exposing the underlying maturity model.

Source-of-truth narrative:

- [One-pager](docs/2026-EX-Maturity-Strategy-onepager.docx)
- [Full strategy doc](docs/2026-EX-Maturity-Strategy.docx)
- [Program Growth maturity mapping](docs/program-growth-maturity-mapping.docx)

## What it shows

The prototype renders a faithful Qualtrics XM home page with a left-rail project list and a "Program Growth" panel. Behind the scenes, the recommendation engine in `src/data/maturityActions.ts`:

1. Derives a simulated `AccountState` from the user's projects (which programs exist, which features are enabled, response volumes).
2. Evaluates that state against the EX maturity framework (**Listen / Understand / Act**).
3. Emits outcome-focused `GrowthAction`s for the gaps, each surfaced under the **XM Advisor** badge.

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
  App.tsx                    Top-level shell, demo banner, home / project view switch
  components/
    ProgramOverview.tsx      Home: project sidebar, key metrics, Program Growth panel
    ProgramGrowthTab.tsx     Listen / Understand / Act 3-column recommendation grid
    Header.tsx, ...
  data/
    maturityActions.ts       Recommendation engine (the brain of the demo)
    mockProjects.ts          Six fixture projects
    mockHeatmapData.ts, mock_comments.csv
  styles/qualtrics.css       All design tokens and component classes
  types/index.ts             Project, GrowthAction, GrowthCategory, ...
  utils/insightGenerator.ts  Theme + sentiment math over mock_comments
docs/                        Strategy docs + scripts to regenerate them
```

For operational guidance when editing the repo (conventions, build rules, what's safe vs. legacy code), see [CLAUDE.md](./CLAUDE.md).

## Demo banner

Every view renders a banner at the top linking to the Google Drive copies of the one-pager and strategy doc, with contact info for Noah Kalodner. It's the audience's primary path to context when they hit the demo cold, so leave it in place.

## Status

This is a UX prototype, not a working product. All data is static mock data. There is no API integration and there should not be one.
