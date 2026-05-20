# Recommended Interventions: A PM Framework

**Status:** v2 draft
**Audience:** Product Managers proposing or reviewing new recommended actions in EX
**Canonical types:** `src/types/index.ts` (`GrowthAction`, `GrowthOption`, `GrowthCategory`)
**Live engine:** `src/data/maturityActions.ts` (`generateGrowthActions`)
**Companion docs:** `2026-EX-Maturity-Strategy.docx`, `program-growth-maturity-mapping.docx`

---

## Why this exists

We have two recommendation surfaces in the EX product:

- **Home page nudge** — one highly visible recommendation. Today this is hard-coded to the listening-frequency family (`HomeListeningNudge.tsx`). Most admins see this; very few will navigate deeper unless we tell them to.
- **EX Growth tab** — the full Listen / Understand / Act framework rendered by `ProgramGrowthTab.tsx`, fed by `generateGrowthActions()`. Lower visual density per card, all interventions visible.

Both surfaces draw from the same `AccountState` derived in `deriveAccountState()`, and (in time) the same `GrowthAction[]`. Without a shared framework, each PM will define an intervention differently and one or both surfaces will turn into a junk drawer.

This doc says: every new intervention must declare the same set of fields before it ships, regardless of which surface(s) it ends up on.

---

## What an intervention is

An **intervention** is a single recommended action that:

1. Activates based on the brand's `AccountState`
2. Surfaces on at least one defined surface (home and/or EX Growth)
3. Drives the brand toward a measurable outcome
4. Can be dismissed, snoozed, configured, or actioned

If your idea can't be expressed as *"when X is true about this brand, recommend they do Y, and we'll know it worked if Z"* — it's not an intervention yet.

---

## How the framework maps to the code

The customer-facing shape is a `GrowthAction`:

```ts
interface GrowthAction {
  id: string;
  title: string;        // outcome-oriented headline
  description: string;  // why this matters
  category: GrowthCategory;        // 'listen' | 'understand' | 'act'
  ctaLabel?: string;               // single-path actions
  options?: GrowthOption[];        // multi-path actions
}
```

Fields like *triggers*, *eligibility*, *priority weight*, *success metric* don't live on `GrowthAction` directly. Today they live in the imperative logic of `generateGrowthActions()` (an `if` branch is implicitly the positive trigger; what's missing is a negative trigger). The framework forces PMs to declare them in prose so engineering can lift them into structured fields when the engine gets formalized.

**Home eligibility is its own concept.** Only listening-frequency interventions can be elevated to the home today (`HomeListeningNudge.tsx` is hard-coded to that family). When another family becomes home-eligible, we'll need a `featured` or `homeEligible` flag and tie-breaking logic.

---

## Engagement vs Pulse framing (load-bearing)

The listening-frequency interventions below assume a particular framing of engagement and Pulse. Two pieces:

- **Engagement** is the *comprehensive* listening program: it reaches all employees and asks the full battery. When you have headroom on response rate, the move is to expand engagement frequency itself (annual → biannual → quarterly). Engagement carries the brand's primary listening signal.
- **Pulse** is a *sampled monthly cadence*. Each month a small slice of the population (~5%) is invited to answer a short set of priority questions, rotated so every employee is heard over time. Pulse **supplements** engagement; it does not replace it.

This drives where Pulse appears in the tiering:

- At **low response** (< 70%) Pulse appears as a **gap-fill**. Layering another full-population cycle on a survey that isn't getting through doesn't help; a sampled cadence builds a parallel signal without asking more of any one employee.
- At **mid/high response** (≥ 70%) Pulse appears as a **complement** alongside the cadence expansion. A strong engagement program tells you where you stand; Pulse keeps a finger on the few metrics you most want to watch between cycles.

The home nudge, the EX Growth recommendation engine, and the strategy docs all use this framing consistently.

---

## The interventions we have today

Worked examples. When you propose a new intervention, write a row that matches this shape.

### 1. Improve existing program  *(very-low response: < 30%)*
- **GrowthAction id:** `improve-existing-program`
- **Positive triggers:** `engagePulseResponseRate < 0.30`
- **Negative triggers:** Active improvement review in flight; dismissed within last 90 days
- **Eligibility:** Any EX license; admin role
- **Surfaces:** Home (slide 1 of 3 in carousel) + EX Growth (single card under Listen)
- **Personalization tokens:** `{engagePulseResponseRate}`
- **CTA pattern:** Guided — optional context capture, then human-in-loop with XM strategist
- **Conflict set:** Complementary with Pulse and Lifecycle; takes the primary slot at this severity (severity over opportunity)
- **Priority weight:** Highest when active
- **Success metric:** Response rate of next annual cycle improves by ≥15 points, *or* strategist confirms root cause is addressed
- **Measurement window:** 12 months (lift) / 2 weeks (engagement)
- **Resurfacing rules:** Snooze 30 days, dismiss 90 days; re-trigger if root-cause review completes without lift
- **Effort estimate:** 2 min for the admin; 2–4 weeks of strategist engagement

### 2. Pulse supplement (sampled cadence, gap-fill mode)  *(low response: < 70%)*
- **GrowthAction id:** `add-pulse-supplement` *(suppressed when `state.hasActivePulse`)*
- **Positive triggers:** `0.30 ≤ engagePulseResponseRate < 0.70`; no active Pulse program already
- **Negative triggers:** Active Pulse program already running; dismissed within 60 days
- **Eligibility:** Included in EX license; admin role
- **Surfaces:** Home (slide 1 of 2 in the low-response carousel; slide 2 of 3 in the very-low) + EX Growth (single card under Listen)
- **Personalization tokens:** `{engagePulseResponseRate}`, `{engagePulseResponses}`, `{engagePulseInvited}` (sample size = ~5%)
- **CTA pattern:** Auto-configure — one-click set-up, first send queues for the 15th of the following month
- **Conflict set:** Complementary with engagement, lifecycle, and 360; same family as `add-pulse-complement` (the cadence-expansion variant)
- **Priority weight:** Primary in the low-response (< 70%) tier; secondary in very-low
- **Success metric:** First three monthly Pulse sends each hit ≥75% completion on the sampled population; aggregate signal correlates with the next annual cycle
- **Measurement window:** 90 days post-enablement
- **Resurfacing rules:** Snooze 60 days, dismiss 120 days; re-trigger on further response-rate drop
- **Effort estimate:** ~2 min for the admin; ongoing system runs the cadence

### 3. Biannual cadence  *(mid response: 70–84%)*
- **GrowthAction id:** `add-biannual-cadence`
- **Positive triggers:** `0.70 ≤ engagePulseResponseRate < 0.85`
- **Negative triggers:** Biannual or quarterly already running; dismissed within 90 days
- **Eligibility:** Included in EX license; admin role; inheritable annual program
- **Surfaces:** Home (slide 1 of 2 in carousel) + EX Growth (single card under Listen)
- **Personalization tokens:** `{engagePulseResponseRate}`, `{engagePulseResponses}`, `{programName}`
- **CTA pattern:** Auto-configure ("Configure it for me") or guided ("Configure myself")
- **Conflict set:** Mutually exclusive with quarterly cadence; complementary with Pulse-complement, Lifecycle, and 360
- **Priority weight:** Primary in tier
- **Success metric:** First biannual completion rate ≥70%; no fatigue signal (annual response rate sustained or improved next cycle)
- **Measurement window:** 6 months (biannual cycle) / 12 months (fatigue check)
- **Resurfacing rules:** Dismiss 6 months
- **Effort estimate:** ~1 min when auto-configured

### 4. Quarterly cadence  *(high response: ≥ 85%)*
- **GrowthAction id:** `add-quarterly-cadence`
- **Positive triggers:** `engagePulseResponseRate ≥ 0.85`
- **Negative triggers:** Quarterly already running; dismissed within 90 days
- **Eligibility:** Included in EX license; admin role; inheritable annual program
- **Surfaces:** Home (slide 1 of 2 in carousel) + EX Growth (single card under Listen)
- **Personalization tokens:** `{engagePulseResponseRate}`, `{engagePulseResponses}`
- **CTA pattern:** Auto-configure or guided
- **Conflict set:** Mutually exclusive with biannual cadence; complementary with Pulse-complement, Lifecycle, and 360
- **Priority weight:** Primary in tier
- **Success metric:** First quarterly completion rate ≥65%; sustained annual response next cycle (no fatigue)
- **Measurement window:** 3 months (first cycle) / 12 months (fatigue check)
- **Resurfacing rules:** Dismiss 6 months
- **Effort estimate:** ~1 min when auto-configured

### 5. Pulse complement (sampled cadence, alongside expanded engagement)  *(mid + high response)*
- **GrowthAction id:** `add-pulse-complement` *(suppressed when `state.hasActivePulse`)*
- **Positive triggers:** `engagePulseResponseRate ≥ 0.70`; no active Pulse program already
- **Negative triggers:** Active Pulse program already running; dismissed within 90 days
- **Eligibility:** Included in EX license; admin role
- **Surfaces:** Home (slide 2 of 2 in mid/high carousel) + EX Growth (single card under Listen, sibling of the cadence card)
- **Personalization tokens:** `{engagePulseInvited}` (drives sample-size copy)
- **CTA pattern:** Auto-configure — same set-up flow as Pulse-supplement
- **Conflict set:** Same family as `add-pulse-supplement`; complementary with biannual, quarterly, lifecycle, and 360
- **Priority weight:** Secondary in tier (cadence card is primary)
- **Success metric:** Pulse completion sustains ≥75% on sampled population; managers report Pulse insights as actionable in next QBR
- **Measurement window:** 90 days post-enablement
- **Resurfacing rules:** Dismiss 6 months
- **Effort estimate:** ~2 min for the admin; ongoing system runs the cadence

### 6. Lifecycle (onboarding)  *(low response: < 70%, secondary)*
- **GrowthAction id:** `add-lifecycle-program` *(on EX Growth: `add-lifecycle` if no lifecycle exists; `grow-lifecycle` if a thin one does)*
- **Positive triggers:** `engagePulseResponseRate < 0.70`; new hires per year > 50; no lifecycle program already running
- **Negative triggers:** Lifecycle program already running with healthy volume; dismissed within 90 days
- **Eligibility:** **Requires a license expansion** (sales contact); admin role; HRIS connection with hire date
- **Surfaces:** Home (slide 2 of low-response carousel; slide 3 of very-low) + EX Growth (single card under Listen)
- **Personalization tokens:** `{engagePulseResponseRate}`
- **CTA pattern:** Human-in-loop — routes the admin to their account team
- **Conflict set:** Complementary with every other intervention
- **Priority weight:** Secondary in low-response; tertiary in very-low
- **Success metric:** First-year regrettable attrition reduction; new-hire participation ≥80%
- **Measurement window:** 12 months
- **Resurfacing rules:** Dismiss 6 months; re-trigger on further response-rate drop or new-hire volume increase
- **Effort estimate:** 2 min to request; weeks of sales cycle

### 7. Multi-rater feedback (360)  *(cadence-independent, leadership development)*
- **GrowthAction id:** `add-360`
- **Positive triggers:** No active 360 program (`!state.has360`)
- **Negative triggers:** 360 already running; dismissed within 6 months
- **Eligibility:** Included in EX license; admin role
- **Surfaces:** EX Growth only (single card under Listen). Not home-eligible today.
- **Personalization tokens:** none
- **CTA pattern:** Guided — routes to the 360 setup flow
- **Conflict set:** Complementary with every other listening intervention; runs on its own cadence
- **Priority weight:** Tier-independent; competes for column slot
- **Success metric:** First 360 cycle completion ≥70% across rated leaders; ≥60% of rated leaders accept at least one development action
- **Measurement window:** 60 days (first cycle) / 6 months (action follow-through)
- **Resurfacing rules:** Dismiss 6 months
- **Effort estimate:** 30 min to set up; per-leader effort thereafter

---

## Required fields, explained

Every intervention proposal must answer all of these. Field-by-field notes on what goes wrong when they're skipped:

**GrowthAction id.** Stable identifier used in the code (`id` field on `GrowthAction`). Once set, don't rename — analytics and resurfacing rules depend on it. *Failure mode: bumping the id every time the copy changes, breaking dismissal state.*

**Positive triggers.** The data conditions that activate this, expressed in terms of `AccountState` fields. Usually a threshold (response rate, headcount, time since last cycle). *Failure mode: triggers written as "when the customer would benefit" instead of a queryable condition.*

**Negative triggers (suppression).** The single most overlooked field. When does this not show even though positives fire — already running, recently dismissed, anonymity floor not met, conflicting program active. *Failure mode: surface fatigue from interventions that won't take no for an answer.*

**Eligibility.** Hard gates: license tier, role/permission, required data sources, geography. Different from negative triggers — these are about *can the customer act on this at all*. *Failure mode: recommending something they can't buy or can't configure.*

**Surfaces.** Where this intervention can appear (home, EX Growth, both). The home is restricted; EX Growth is default. *Failure mode: assuming home eligibility without declaring it.*

**Personalization tokens.** The specific `AccountState` fields woven into the rendered copy. Declare them so copy is consistent, translatable, and we can swap the data source without rewriting every card. *Failure mode: hard-coded numbers in copy that drift from `AccountState`.*

**CTA pattern.** One of: **auto-configure** (one click does it), **guided** (we walk them through), **human-in-loop** (we route them to a human — sales, CSM, strategist). Drives both the button label and the destination. *Failure mode: "Learn more" buttons that go to documentation black holes.*

**Conflict set.** Which other interventions this is mutually exclusive with vs complementary with. *Failure mode: recommending biannual and quarterly side by side.*

**Priority weight.** How this ranks against other interventions that simultaneously qualify, both globally and in tie-breakers. *Failure mode: primary slot decided by whoever ships last.*

**Success metric + measurement window.** What "this worked" looks like, by when. The most hand-waved field. If you can't define it, you can't tune the trigger or defend the surface real estate. *Failure mode: interventions stay on the surface forever because nobody can prove they don't work.*

**Resurfacing rules.** After dismiss/snooze, when do we ask again? What data change would re-trigger? *Failure mode: either nagging or forgetting forever.*

**Effort estimate.** How long for the user (and any downstream party — sales, CSM, managers). Lets us sort by quick wins and set expectations. *Failure mode: one-click in the demo, six-week project in reality.*

---

## Definition of done

Before proposing a new intervention to review:

- [ ] Every required field above is populated, not just the obvious ones
- [ ] The success metric is a number with a window, not a vibe
- [ ] You've checked the conflict set against every existing intervention in `maturityActions.ts`
- [ ] You've described the negative triggers explicitly (don't leave them implicit)
- [ ] The CTA pattern matches what we can actually build now (no fictional auto-configure)
- [ ] There's a resurfacing rule even if it's "never re-ask"
- [ ] You've identified at least one existing intervention this is structurally similar to, and noted what's different
- [ ] If this proposes home eligibility, you've made the case for displacing the current home nudge (or declaring co-existence rules)

Reviewers can and should block on any of these. The bar is *"is this measurable and ship-able"* not *"does this sound nice."*

---

## Prioritization & conflicts

**One primary slot per surface.** Home has exactly one. EX Growth's Listen / Understand / Act columns each have up to 3 cards. When more than three actions qualify for a column, the lower-priority ones are dropped (see `MAX_PER_COLUMN` in `ProgramGrowthTab.tsx`).

**Severity over opportunity.** When a "fix" intervention (e.g. Improve) and an "expand" intervention (e.g. Biannual cadence) both fire, the fix wins primary. We don't recommend doing more of a broken thing.

**Mutually exclusive ⇒ only one in the carousel.** Biannual and quarterly should never appear together. The trigger ranges should not overlap; if they do, the framework is broken, not the intervention.

**Complementary ⇒ they can coexist.** Pulse + Lifecycle is fine: different mechanisms, different audiences within the org.

**Tie-breakers, in order:** (1) higher priority weight, (2) lower effort estimate, (3) shorter time-to-measurable-outcome.

**Home eligibility tie-breaker:** *not yet defined.* Today only the listening-frequency family is home-eligible. When that opens up, this section needs to define how the home picks its one nudge.

---

## What this doc doesn't decide

- The actual visual design of cards (that's design)
- Which interventions ship first (that's roadmap)
- Anything about non-EX surfaces (CX, BX have their own families; framework should generalize, but examples here are EX-specific)

---

## Appendix: schema reference

`GrowthAction` and `GrowthOption` are the canonical customer-facing shapes (see `src/types/index.ts`). The fields below are the **framework metadata** that hangs off each intervention. Today most of these live in the imperative logic of `generateGrowthActions()`; making them structured is a future step.

```yaml
intervention:
  # Maps directly to GrowthAction
  id: string                       # GrowthAction.id
  title: string                    # GrowthAction.title
  description: string              # GrowthAction.description
  category: "listen" | "understand" | "act"   # GrowthAction.category
  cta_label: string                # GrowthAction.ctaLabel (single-path)
  options:                         # GrowthAction.options (multi-path)
    - id: string                   # GrowthOption.id
      label: string                # GrowthOption.label
      description: string          # GrowthOption.description
      cta_label: string            # GrowthOption.ctaLabel

  # Framework metadata (not yet typed in code)
  family: string                   # e.g. "listen-more"
  triggers:
    positive: [condition]          # over AccountState fields
    negative: [condition]
  eligibility:
    license_tier: [string]
    role: [string]
    required_data_sources: [string]
    geographies: [string]
  surfaces: ["home", "ex-growth"]
  personalization_tokens: [string] # AccountState field names
  cta:
    pattern: "auto" | "guided" | "human-in-loop"
    destination: string
  conflicts:
    exclusive_with: [intervention_id]
    complementary_with: [intervention_id]
  priority_weight: number
  success:
    metric: string
    target: string
    window: string
  resurfacing:
    snooze_days: number
    dismiss_days: number
    retrigger_on: [condition]
  effort:
    user_minutes: number
    downstream: string
```

PMs should argue about which fields belong here, not how they serialize. Engineering will translate.
