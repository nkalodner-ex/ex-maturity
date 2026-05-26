# CLAUDE.md

Operational guide for Claude working in this repo. Read this before making changes.

## What this project is

A **clickable prototype of the 2026 EX Maturity strategy** for Qualtrics XM. The app is a faithful Qualtrics UI mockup that demonstrates a personalized "Program Growth" experience: the system internally evaluates an account against the EX maturity framework (Listen / Understand / Act) and surfaces outcome-focused recommendations through an **XM Advisor** badge. The customer never sees maturity levels or scores — only nudges toward their next best step.

The repo started life as a Text iQ insight-surfacing demo and has since grown well beyond that. **Do not describe this project as a Text iQ demo.** Text iQ is one of many features the maturity engine can recommend, not the headline. `README.md` reflects the current framing; treat it as accurate.

There are **two recommendation surfaces** in the app today, with different roles:

- **Home page** — sidebar of recent projects, a **Program at a glance** overview metrics row, and one highly visible Growth recommendation. The growth nudge is restricted to the listening-frequency family (Improve / Pulse / Biannual / Quarterly / Lifecycle), rendered as a rich tier-aware carousel by `HomeListeningNudge.tsx`. Most admins see only this view.
- **EX Growth tab** (hamburger menu) — two sections in `ProgramGrowthTab.tsx`: (1) **Listening timeline** showing engagement/Pulse/lifecycle/360 across the year (`AnnualTimeline.tsx`), (2) **Recommended next steps** — the full Listen / Understand / Act framework from `generateGrowthActions()`, collapsed by default into an expandable card beneath the timeline. Comprehensive, lower density per card.

Both surfaces read from the same `AccountState` derived in `deriveAccountState()`. The home picks its single nudge by tiering on `engagePulseResponseRate`. EX Growth shows all qualifying actions. See `docs/INTERVENTION_FRAMEWORK.md` for the PM framework that defines what an intervention needs to declare before it ships.

**Engagement vs Pulse framing.** This is a load-bearing distinction:
- **Engagement** = comprehensive, reaches *all employees*. The right move when you have headroom on response rate is to expand engagement frequency (annual → biannual → quarterly).
- **Pulse** = sampled monthly cadence. Each month a small slice of the population (~5%) gets a short set of priority questions, rotated so everyone is heard over time. Pulse *supplements* engagement; it does not replace it. At low response rates it fills the gap when full-population surveys aren't reaching enough people; at high response rates it adds a between-cycle finger-on-the-pulse layer.

If you're tempted to frame Pulse as "manager-led 1:1 check-ins" or as a smaller-engagement-survey, stop — that was the v1 framing and is now wrong. The reframe is intentional and consistent across `HomeListeningNudge.tsx`, `generateGrowthActions()`, and the strategy docs.

No hosted demo right now — run it locally with `npm run dev`. Source-of-truth narrative lives in `docs/2026-EX-Maturity-Strategy.docx` and `docs/2026-EX-Maturity-Strategy-onepager.docx`.

## Stack

- Vite + React 19 + TypeScript (strict)
- `lucide-react` for icons, `recharts` available
- Plain CSS, scoped through `src/styles/qualtrics.css` (the design system)
- No state library, no router — view switching is a `useState` in `App.tsx`
- No hosting wired up; `npm run build` (runs `tsc -b` first) produces `dist/` for any future host

## Repo layout

```
src/
  App.tsx                       Top-level shell, demo banner, hamburger nav (Home | EX Growth | Project)
  main.tsx                      React entry
  components/
    ProgramOverview.tsx         Home view: sidebar of projects + Program at a glance
                                metrics row + Growth nudge. Listening timeline lives
                                on the EX Growth tab.
    HomeListeningNudge.tsx      The home's rich tier-aware listening-frequency card +
                                carousel. The ONLY family allowed on the home today.
                                Pulse here = sampled monthly cadence (~5%/month).
    ProgramGrowthTab.tsx        EX Growth tab: stacks (1) AnnualTimeline,
                                (2) the 3-column Listen / Understand / Act
                                recommendations grid, collapsed by default
                                inside an expandable card beneath the timeline.
    AnnualTimeline.tsx          12-month calendar strip showing where each project's
                                surveys send (annual marker, monthly markers,
                                continuous stripe). Rows are clickable to navigate
                                into the associated project view.
    Header.tsx                  Top XM bar (used inside views)
    Dashboard.tsx               Legacy dashboard view (kept but not currently routed to)
    AddWidgetModal.tsx          Legacy Text iQ widget picker (kept but not currently used)
    HeatmapWidget.tsx           Heatmap viz used by Dashboard
    InsightBanner.tsx           XM Advisor banner pattern
    ThemeDetailCard.tsx, ProjectList.tsx, EmptyState.tsx
  data/
    maturityActions.ts          *** Core logic. Exports AccountState (the type), the
                                deriveAccountState(projects) helper, and the
                                generateGrowthActions(projects) recommendation engine.
                                This is the brain of the demo. Both the home nudge and
                                EX Growth read from AccountState.
    mockProjects.ts             The six fixture projects (Employee Engagement is the
                                only clickable one — id 'employee_engagement'). The EE
                                project carries responseCount + invited which drives
                                engagePulseResponseRate.
    mockHeatmapData.ts          Heatmap fixture
    mock_comments.csv           200 mock employee comments
  styles/qualtrics.css          Qualtrics design tokens + every component class. ~28KB.
                                Namespaces: xm- (shell), prog- (program overview),
                                pg- (program growth grid), home-growth- (home section
                                header), home-nudge- (home rich card + widgets).
                                If you need a new style, add it here, not inline.
  types/index.ts                Project, GrowthAction, GrowthOption, GrowthCategory,
                                ThemeInsight, etc.
  utils/insightGenerator.ts     Theme extraction / sentiment math over mock_comments

docs/
  2026-EX-Maturity-Strategy.docx           Full strategy doc (source of truth)
  2026-EX-Maturity-Strategy-onepager.docx  Exec one-pager
  program-growth-maturity-mapping.docx     Feature → maturity-level mapping
  INTERVENTION_FRAMEWORK.md / .docx        PM framework: required fields, definition of
                                           done, and worked examples for the five current
                                           interventions. Update this whenever the
                                           shape of a GrowthAction or its metadata
                                           changes.
  scripts/
    build-onepager.cjs          Regenerates the .docx one-pager
    build-strategy-doc.cjs      Regenerates the full strategy .docx
    fix-emdash.py               Strips em dashes from generated docs
```

## Current focus

Three places where most iteration happens, in roughly the order you'll touch them:

1. **`data/maturityActions.ts`** — the recommendation engine. `AccountState`, `deriveAccountState`, and `generateGrowthActions`. Both the home nudge and EX Growth read from this.
2. **`components/HomeListeningNudge.tsx`** — the home's tier-aware listening-frequency card and carousel. Today this is the only family that can appear on the home; if you're asked to elevate another family, that's a framework change (see `docs/INTERVENTION_FRAMEWORK.md` and ask before doing it).
3. **`components/ProgramGrowthTab.tsx`** — the 3-column EX Growth grid (collapsed by default behind a toggle below the timeline). Rendered on its own tab via the hamburger menu.

The Project View (Employee Engagement setup checklist inside `App.tsx`) is secondary — it exists to show "what happens after you click into a project" but isn't where the demo's value lives.

`Dashboard.tsx`, `AddWidgetModal.tsx`, and the Text iQ modal are **legacy from the prototype's earlier life**. They are not currently wired into the user flow (the Dashboards tab and Text iQ setup prompt were intentionally removed — see commit `0f05f02`). Leave them in place but don't extend them without checking first.

## Conventions to follow

**Match the Qualtrics design system.** All UI must use the variables, colors, and class patterns established in `src/styles/qualtrics.css`. Don't introduce new design tokens, ad-hoc hex values inline, or competing class naming schemes. When adding a component, add its styles to `qualtrics.css` under a clear namespace prefix (e.g. `pg-` for Program Growth, `prog-` for Program Overview, `xm-` for the XM shell).

**No em dashes in user-facing copy.** Every "—" in recommendation text, descriptions, and banner copy has been scrubbed (see commit `7524237`). Use a regular hyphen or rephrase. `docs/scripts/fix-emdash.py` enforces this for the generated docs.

**Customer never sees maturity levels or scores.** The maturity model lives entirely server-side (here: inside `maturityActions.ts`). Outputs are outcome-oriented headlines and "why this matters" descriptions — never "you're at Level 2" or numeric scores. This is a product principle, not just copy guidance.

**TypeScript strict mode is on.** `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `verbatimModuleSyntax` are all enabled. Use `import type { ... }` for type-only imports.

**Build must pass.** `npm run build` runs `tsc -b && vite build`. A previous commit (`eb6cb3f`) had to clean up dead code that broke the production build but passed `npm run dev` locally — be wary of unreachable branches and dead exports.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b && vite build → dist/
npm run lint     # eslint
npm run preview  # preview built bundle
```

Before declaring work done on a non-trivial change, run `npm run build` — it surfaces the TS errors that `npm run dev` will let through.

## Demo banner

`App.tsx` renders a persistent banner at the top of every view linking to the Google Drive one-pager and full strategy doc, plus a "Reach out to Noah Kalodner" contact line. Don't remove it — it's the audience's primary path to context when they land on the demo cold. If the docs change, regenerate them from `docs/scripts/` and re-upload to Drive; the banner URLs are hardcoded in `App.tsx`.

## Mock data conventions

- `mockProjects.ts` has six projects. Only `id === 'employee_engagement'` is clickable; the rest are intentionally inert in the sidebar.
- `maturityActions.ts` derives an `AccountState` from those projects and a bunch of hardcoded booleans (`hasTextIQ: false`, `hasWorkflows: false`, etc.). To simulate a more mature account, flip those booleans in `deriveAccountState` — don't add new fixture projects unless the demo specifically needs them.
- The Employee Engagement project carries `responseCount` + `invited`, which `deriveAccountState` turns into `engagePulseResponseRate`. That field tiers both the home nudge and the EX Growth listen-frequency action consistently:
  - `< 0.30` → Improve / Pulse-gap-fill / Lifecycle (`improve-existing-program` on EX Growth)
  - `< 0.70` → Pulse-gap-fill / Lifecycle (`add-pulse-supplement` on EX Growth)
  - `< 0.85` → Biannual / Pulse-complement (`add-biannual-cadence` + `add-pulse-complement` on EX Growth)
  - `≥ 0.85` → Quarterly / Pulse-complement (`add-quarterly-cadence` + `add-pulse-complement` on EX Growth)
  Change `responseCount` / `invited` in `mockProjects.ts` to demo a different tier. The Pulse slides/cards self-suppress when an active Pulse program already exists (`state.hasActivePulse`).
- The default demo state ships with a `monthly_pulse` project active (`programKind: 'pulse'`, monthly cadence on the 15th). That populates the EX Growth tab's listening timeline with the engagement-plus-Pulse story but **also flips `state.hasActivePulse` to true**, which suppresses every Pulse recommendation across both surfaces. At the current 58% response rate this means the home shows only the Lifecycle slide (Pulse-gap-fill is suppressed) and EX Growth's Listen column drops the listen-frequency action entirely (silent at low RR + active Pulse — adding more cycles on top of a low-response annual would be wrong).
- **Demo settings panel** (`App.tsx`, opened from the "Demo settings" button in the banner) consolidates two runtime controls so the audience can cycle through customer states without code changes:
  - **Customer profile** — four presets (`Struggling` 22%, `Building` 58%, `Healthy` 78%, `Exceptional` 92%). Each overrides the Annual Engagement project's `responseCount` so `engagePulseResponseRate` lands in a different tier band. Both surfaces (home nudge + EX Growth) re-derive live. The Response Rate metric card on the home's Program at a glance row and its trend copy are profile-driven too (passed in via the `responseRate` prop on `ProgramOverview`); other metric cards stay static.
  - **Monthly Pulse program** — same toggle as before, just relocated into the panel. ON = engagement + Pulse on the timeline, Pulse recommendations suppressed. OFF = Pulse filtered out of the project list, timeline shows just the annual engagement dot, and Pulse-supplement / Pulse-complement recommendations fire as appropriate to the profile.
  When adding a new demo lever, add it to this panel rather than to the banner — the banner is for context, the panel is for controls.
- The static metrics block (`STATIC_METRICS` + `DEFAULT_RESPONSE_RATE`) lives in `ProgramOverview.tsx`. Keep its `Response Rate` value in sync with the engine's `engagePulseResponseRate` — drift contradicts the demo.
- Project schedules live on `mockProjects[*].schedule` (`ProjectSchedule`). Cadences: `annual`, `biannual`, `quarterly`, `monthly`, `continuous`, `one-time`. The `AnnualTimeline` reads from these — to add a new survey to the timeline, add a `schedule` to the project (or invent a new project with one). Projects without `schedule`, or with `status: 'closed'`, are filtered out.
- All data is static. There is no API integration and there should not be one. This is a UX prototype, not a working product.

## Things to ask before doing

- Adding a new dependency. Stack is intentionally minimal.
- Adding a new top-level view or tab.
- Changing the maturity framework (Listen / Understand / Act categories) or the shape of `GrowthAction` / `GrowthOption` — these are coordinated with `docs/program-growth-maturity-mapping.docx` and `docs/INTERVENTION_FRAMEWORK.md`.
- Adding a new intervention family to the **home page nudge**. The home is restricted today; expanding it requires the framework doc's "home eligibility" rules, which aren't fully defined yet.

## Git

Default branch: `main`. Commit messages follow conventional-commits style (`feat:`, `fix:`, `chore:`). Keep them short and outcome-oriented — recent history is a good reference.
