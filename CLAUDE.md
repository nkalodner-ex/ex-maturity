# CLAUDE.md

Operational guide for Claude working in this repo. Read this before making changes.

## What this project is

A **clickable prototype of the 2026 EX Maturity strategy** for Qualtrics XM. The app is a faithful Qualtrics UI mockup that demonstrates a personalized "Program Growth" experience: the system internally evaluates an account against the EX maturity framework (Listen / Understand / Act) and surfaces outcome-focused recommendations through an **XM Advisor** badge. The customer never sees maturity levels or scores — only nudges toward their next best step.

The repo started life as a Text iQ insight-surfacing demo and has since grown well beyond that. **Do not describe this project as a Text iQ demo.** Text iQ is one of many features the maturity engine can recommend, not the headline. `README.md` reflects the current framing; treat it as accurate.

Live demo: deployed on Vercel from the `main` branch. Source-of-truth narrative lives in `docs/2026-EX-Maturity-Strategy.docx` and `docs/2026-EX-Maturity-Strategy-onepager.docx`.

## Stack

- Vite + React 19 + TypeScript (strict)
- `lucide-react` for icons, `recharts` available
- Plain CSS, scoped through `src/styles/qualtrics.css` (the design system)
- No state library, no router — view switching is a `useState` in `App.tsx`
- Deployed via Vercel; the `npm run build` step (which runs `tsc -b` first) is what Vercel runs

## Repo layout

```
src/
  App.tsx                       Top-level shell, demo banner, view switcher (home | project)
  main.tsx                      React entry
  components/
    ProgramOverview.tsx         Home view: sidebar of projects + key metrics + Program Growth
    ProgramGrowthTab.tsx        The 3-column Listen / Understand / Act recommendation grid
    Header.tsx                  Top XM bar (used inside views)
    Dashboard.tsx               Legacy dashboard view (kept but not currently routed to)
    AddWidgetModal.tsx          Legacy Text iQ widget picker (kept but not currently used)
    HeatmapWidget.tsx           Heatmap viz used by Dashboard
    InsightBanner.tsx           XM Advisor banner pattern
    ThemeDetailCard.tsx, ProjectList.tsx, EmptyState.tsx
  data/
    maturityActions.ts          *** Core logic. Derives a simulated AccountState from
                                projects and emits GrowthActions per maturity gap. This
                                is the brain of the demo.
    mockProjects.ts             The six fixture projects (Employee Engagement is the
                                only clickable one — id 'employee_engagement')
    mockHeatmapData.ts          Heatmap fixture
    mock_comments.csv           200 mock employee comments
  styles/qualtrics.css          Qualtrics design tokens + every component class. ~25KB.
                                If you need a new style, add it here, not inline.
  types/index.ts                Project, GrowthAction, GrowthCategory, ThemeInsight, etc.
  utils/insightGenerator.ts     Theme extraction / sentiment math over mock_comments

docs/
  2026-EX-Maturity-Strategy.docx           Full strategy doc (source of truth)
  2026-EX-Maturity-Strategy-onepager.docx  Exec one-pager
  program-growth-maturity-mapping.docx     Feature → maturity-level mapping
  scripts/
    build-onepager.cjs          Regenerates the .docx one-pager
    build-strategy-doc.cjs      Regenerates the full strategy .docx
    fix-emdash.py               Strips em dashes from generated docs
```

## Current focus

**Program Growth tab (`ProgramGrowthTab.tsx`) and the recommendation engine in `data/maturityActions.ts`.** Most active iteration happens here. When in doubt about what to work on, assume changes touch one of those two files. The Project View (Employee Engagement setup checklist inside `App.tsx`) is secondary — it exists to show "what happens after you click into a project" but isn't where the demo's value lives.

`Dashboard.tsx`, `AddWidgetModal.tsx`, and the Text iQ modal are **legacy from the prototype's earlier life**. They are not currently wired into the user flow (the Dashboards tab and Text iQ setup prompt were intentionally removed — see commit `0f05f02`). Leave them in place but don't extend them without checking first.

## Conventions to follow

**Match the Qualtrics design system.** All UI must use the variables, colors, and class patterns established in `src/styles/qualtrics.css`. Don't introduce new design tokens, ad-hoc hex values inline, or competing class naming schemes. When adding a component, add its styles to `qualtrics.css` under a clear namespace prefix (e.g. `pg-` for Program Growth, `prog-` for Program Overview, `xm-` for the XM shell).

**No em dashes in user-facing copy.** Every "—" in recommendation text, descriptions, and banner copy has been scrubbed (see commit `7524237`). Use a regular hyphen or rephrase. `docs/scripts/fix-emdash.py` enforces this for the generated docs.

**Customer never sees maturity levels or scores.** The maturity model lives entirely server-side (here: inside `maturityActions.ts`). Outputs are outcome-oriented headlines and "why this matters" descriptions — never "you're at Level 2" or numeric scores. This is a product principle, not just copy guidance.

**TypeScript strict mode is on.** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `verbatimModuleSyntax` are all enabled. Use `import type { ... }` for type-only imports.

**Vercel build must pass.** The build runs `tsc -b && vite build`. A previous commit (`eb6cb3f`) had to clean up dead code that broke the Vercel build but passed locally — be wary of unreachable branches and dead exports.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → dist/  (what Vercel runs)
npm run lint     # eslint
npm run preview  # preview built bundle
```

Before declaring work done on a non-trivial change, run `npm run build` — it surfaces the TS errors that `npm run dev` will let through.

## Demo banner

`App.tsx` renders a persistent banner at the top of every view linking to the Google Drive one-pager and full strategy doc, plus a "Reach out to Noah Kalodner" contact line. Don't remove it — it's the audience's primary path to context when they land on the demo cold. If the docs change, regenerate them from `docs/scripts/` and re-upload to Drive; the banner URLs are hardcoded in `App.tsx`.

## Mock data conventions

- `mockProjects.ts` has six projects. Only `id === 'employee_engagement'` is clickable; the rest are intentionally inert in the sidebar.
- `maturityActions.ts` derives an `AccountState` from those projects and a bunch of hardcoded booleans (`hasTextIQ: false`, `hasWorkflows: false`, etc.). To simulate a more mature account, flip those booleans in `deriveAccountState` — don't add new fixture projects unless the demo specifically needs them.
- All data is static. There is no API integration and there should not be one. This is a UX prototype, not a working product.

## Things to ask before doing

- Adding a new dependency. Stack is intentionally minimal.
- Adding a new top-level view or tab.
- Changing the maturity framework (Listen / Understand / Act categories) or the shape of `GrowthAction` / `GrowthOption` — these are coordinated with `docs/program-growth-maturity-mapping.docx`.

## Git

Default branch: `main`. Commit messages follow conventional-commits style (`feat:`, `fix:`, `chore:`). Keep them short and outcome-oriented — recent history is a good reference.
