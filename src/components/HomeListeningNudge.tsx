import { useState, useEffect, type ReactNode } from 'react';
import {
  Sparkles,
  X,
  Mail,
  Lock as LockIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import type { AccountState } from '../data/maturityActions';

/**
 * Home listening nudge.
 *
 * The home surface only ever shows recommendations from the "increase
 * listening frequency" family. Within that family we pick a tier based on the
 * annual engagement response rate. Engagement is framed as the comprehensive
 * program that reaches all employees; Pulse is framed as a sampled monthly
 * cadence (~5% of the population at a time, a small set of priority
 * questions) that supplements rather than replaces engagement.
 *
 *   <  30%  → Improve / Pulse / Lifecycle           (3-slide carousel)
 *   <  70%  → Pulse / Lifecycle                      (2-slide carousel)
 *   <  85%  → Biannual engagement / Pulse complement (2-slide carousel)
 *   >= 85%  → Quarterly engagement / Pulse complement (2-slide carousel)
 *
 * Other GrowthAction families never elevate to the home for now. The
 * dedicated EX Growth tab is where everything else lives.
 */

interface HomeListeningNudgeProps {
  state: AccountState;
  onDismiss?: () => void;
}

type Tier = 'very-low' | 'low' | 'mid' | 'high';

function pickTier(rate: number): Tier {
  if (rate < 0.30) return 'very-low';
  if (rate < 0.70) return 'low';
  if (rate < 0.85) return 'mid';
  return 'high';
}

interface Slide {
  key: string;
  el: ReactNode;
}

export function HomeListeningNudge({ state, onDismiss }: HomeListeningNudgeProps) {
  const tier = pickTier(state.engagePulseResponseRate);

  const handleDismiss = onDismiss ?? (() => {});

  // Pulse slides are suppressed entirely if an active Pulse program already
  // exists (don't recommend something they're already running). At the
  // low/very-low tiers this can reduce the carousel to a single slide.
  const pulseGapFillSlide: Slide | null = state.hasActivePulse
    ? null
    : { key: 'pulse', el: <PulseCard state={state} variant="gap-fill" onDismiss={handleDismiss} /> };

  let slides: Slide[];
  if (tier === 'very-low') {
    slides = [
      { key: 'improve', el: <ImproveCard state={state} onDismiss={handleDismiss} /> },
      ...(pulseGapFillSlide ? [pulseGapFillSlide] : []),
      { key: 'lifecycle', el: <LifecycleCard state={state} onDismiss={handleDismiss} /> },
    ];
  } else if (tier === 'low') {
    slides = [
      ...(pulseGapFillSlide ? [pulseGapFillSlide] : []),
      { key: 'lifecycle', el: <LifecycleCard state={state} onDismiss={handleDismiss} /> },
    ];
  } else if (tier === 'mid') {
    slides = [
      { key: 'biannual', el: <CadenceCard state={state} variant="biannual" onDismiss={handleDismiss} /> },
      ...(state.hasActivePulse ? [] : [{ key: 'pulse', el: <PulseCard state={state} variant="complement" onDismiss={handleDismiss} /> }]),
    ];
  } else {
    slides = [
      { key: 'quarterly', el: <CadenceCard state={state} variant="quarterly" onDismiss={handleDismiss} /> },
      ...(state.hasActivePulse ? [] : [{ key: 'pulse', el: <PulseCard state={state} variant="complement" onDismiss={handleDismiss} /> }]),
    ];
  }

  const [idx, setIdx] = useState(0);
  useEffect(() => { setIdx(0); }, [slides.length]);
  const showsCarousel = slides.length > 1;

  return (
    <div className="home-nudge">
      {showsCarousel && (
        <div className="home-nudge-carousel-controls">
          <span className="home-nudge-counter">
            {idx + 1} of {slides.length}
          </span>
          <div className="home-nudge-arrows">
            <button
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="home-nudge-arrow"
              aria-label="Previous recommendation"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}
              disabled={idx === slides.length - 1}
              className="home-nudge-arrow"
              aria-label="Next recommendation"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {showsCarousel ? (
        <div className="home-nudge-track-clip">
          <div
            className="home-nudge-track"
            style={{ transform: `translateX(-${idx * 100}%)` }}
          >
            {slides.map(s => (
              <div key={s.key} className="home-nudge-slide">
                {s.el}
              </div>
            ))}
          </div>
        </div>
      ) : (
        slides[0].el
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card variants
// ---------------------------------------------------------------------------

interface CardChromeProps {
  onDismiss: () => void;
  children: ReactNode;
}

function CardChrome({ onDismiss, children }: CardChromeProps) {
  return (
    <div className="home-nudge-card">
      <button
        onClick={onDismiss}
        className="home-nudge-dismiss"
        aria-label="Dismiss"
      >
        <X size={16} />
      </button>
      <div className="home-nudge-card-body">{children}</div>
    </div>
  );
}

// --- Biannual / Quarterly cadence (the "expand listening" cards) ----------

interface CadenceCardProps {
  state: AccountState;
  variant: 'biannual' | 'quarterly';
  onDismiss: () => void;
}

function CadenceCard({ state, variant, onDismiss }: CadenceCardProps) {
  const pct = Math.round(state.engagePulseResponseRate * 100);
  const respondents = state.engagePulseResponses.toLocaleString();

  const headline =
    variant === 'biannual'
      ? 'Increase your listening frequency from annual to a biannual cadence'
      : 'Increase your listening frequency from annual to a quarterly cadence';

  const tone: Tone = variant === 'biannual' ? 'blue' : 'green';
  const qualifier = variant === 'biannual' ? 'Strong participation' : 'Exceptional participation';

  const bullets: ReactNode[] =
    variant === 'biannual'
      ? [
          <>
            Your <strong>{pct}% annual response rate</strong> shows your population is bought in,
            so adding a second cycle won't fatigue them
          </>,
          <>
            <strong>2x the listening touchpoints</strong> from the EX license you already pay for,
            with no add-on required
          </>,
          <>
            One additional round of feedback per year from your existing {respondents} respondents,
            so every dollar of license spend covers twice the insight
          </>,
        ]
      : [
          <>
            Your <strong>{pct}% annual response rate</strong> is exceptional, which is exactly when
            expanding to quarterly delivers outsized value
          </>,
          <>
            <strong>4x the listening touchpoints</strong> from the EX license you already pay for,
            with no add-on required
          </>,
          <>
            Three additional rounds of feedback per year from your existing {respondents} respondents,
            turning that engagement into four times the insight per dollar of license spend
          </>,
        ];

  return (
    <CardChrome onDismiss={onDismiss}>
      <div className="home-nudge-card-main">
        <h3 className="home-nudge-headline">{headline}</h3>
        <div className="home-nudge-sub home-nudge-sub-licensed">Included in your license</div>

        <ul className="home-nudge-bullets">
          {bullets.map((b, i) => (
            <li key={i}>
              <span className="home-nudge-bullet-dot">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="home-nudge-ctas">
          <button className="home-nudge-cta-primary">
            <Sparkles size={14} />
            Configure it for me
          </button>
          <button className="home-nudge-cta-secondary">Configure myself</button>
        </div>
      </div>

      <ResponseRateWidget state={state} tone={tone} qualifier={qualifier} />
    </CardChrome>
  );
}

// --- Pulse (sampled monthly cadence; supplements engagement) -------------

interface PulseCardProps {
  state: AccountState;
  /**
   * - 'gap-fill'   → shown when annual response rate is low. Frames Pulse as
   *                  the way to maintain signal when full-population surveys
   *                  aren't reaching enough people.
   * - 'complement' → shown when annual response rate is strong. Frames Pulse
   *                  as a between-cycle finger-on-the-pulse layer on top of
   *                  an already-healthy engagement program.
   */
  variant: 'gap-fill' | 'complement';
  onDismiss: () => void;
}

function PulseCard({ state, variant, onDismiss }: PulseCardProps) {
  const [contactSent, setContactSent] = useState(false);
  const sampleSize = Math.max(1, Math.round(state.engagePulseInvited * 0.05));

  const headline =
    variant === 'gap-fill'
      ? 'Add a Pulse program to supplement your annual engagement'
      : 'Layer on a Pulse program to track between engagement cycles';

  const bullets: ReactNode[] =
    variant === 'gap-fill'
      ? [
          <>
            Pulse takes a different approach than your annual: a small set of
            priority questions sent to a <strong>sample of about {sampleSize.toLocaleString()} employees each month</strong>{' '}
            (~5% of your population), rotated so every employee is heard over time
          </>,
          <>
            Layering on another full cycle won't help if the comprehensive
            survey isn't reaching enough people. <strong>A sampled cadence builds a steady, parallel signal</strong>{' '}
            between annuals without asking more of any one employee
          </>,
          <>
            Keeps a consistent finger on the few metrics you most want to watch
            -- engagement, intent to stay, manager confidence -- so you spot
            shifts before the next annual cycle
          </>,
        ]
      : [
          <>
            Sample <strong>about {sampleSize.toLocaleString()} employees each month</strong>{' '}
            (~5% of your population) with a small set of priority questions,
            rotated so every employee is heard over a roughly 20-month window
          </>,
          <>
            Keeps a consistent finger on the few metrics you most want to watch
            -- engagement, intent to stay, manager confidence -- between your
            engagement cycles
          </>,
          <>
            <strong>No added load on any one employee.</strong> Each individual
            receives at most one Pulse invitation between engagement cycles,
            and the question set stays short
          </>,
        ];

  return (
    <CardChrome onDismiss={onDismiss}>
      <div className="home-nudge-card-main">
        <h3 className="home-nudge-headline">{headline}</h3>
        <div className="home-nudge-sub home-nudge-sub-licensed">Included in your license</div>

        <ul className="home-nudge-bullets">
          {bullets.map((b, i) => (
            <li key={i}>
              <span className="home-nudge-bullet-dot">•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div className="home-nudge-ctas">
          {contactSent ? (
            <span className="home-nudge-ack">
              <CheckCircle2 size={16} />
              Pulse program set up. First send queued for the 15th of next month.
            </span>
          ) : (
            <>
              <button
                className="home-nudge-cta-primary"
                onClick={() => setContactSent(true)}
              >
                <Sparkles size={14} />
                Set up Pulse for me
              </button>
              <button className="home-nudge-cta-secondary">Configure myself</button>
            </>
          )}
        </div>
      </div>

      <PulseSampleWidget sampleSize={sampleSize} invited={state.engagePulseInvited} />
    </CardChrome>
  );
}

// --- Lifecycle (license expansion) ---------------------------------------

interface LifecycleCardProps {
  state: AccountState;
  onDismiss: () => void;
}

function LifecycleCard({ state, onDismiss }: LifecycleCardProps) {
  const [contactSent, setContactSent] = useState(false);

  return (
    <CardChrome onDismiss={onDismiss}>
      <div className="home-nudge-card-main">
        <h3 className="home-nudge-headline">
          Add lifecycle listening at 30, 60, and 90 days after hire
        </h3>
        <div className="home-nudge-sub home-nudge-sub-license-expansion">
          <LockIcon size={11} />
          Requires a license expansion
        </div>

        <ul className="home-nudge-bullets">
          <li>
            <span className="home-nudge-bullet-dot">•</span>
            <span>
              Capture new-hire feedback at the moments retention is most at risk, while the
              onboarding experience is still fresh
            </span>
          </li>
          <li>
            <span className="home-nudge-bullet-dot">•</span>
            <span>
              Auto-triggered from your HRIS once enabled, so onboarding feedback is captured without
              ongoing manual setup
            </span>
          </li>
          <li>
            <span className="home-nudge-bullet-dot">•</span>
            <span>
              <strong>Lifecycle programs are not part of your current EX license.</strong>{' '}
              Your account team can expand your plan to include them.
            </span>
          </li>
        </ul>

        <div className="home-nudge-ctas">
          {contactSent ? (
            <span className="home-nudge-ack">
              <CheckCircle2 size={16} />
              Request sent. Your account team will reach out within 1 business day.
            </span>
          ) : (
            <>
              <button
                className="home-nudge-cta-primary"
                onClick={() => setContactSent(true)}
              >
                <Mail size={14} />
                Contact my account team
              </button>
              <button className="home-nudge-cta-secondary">Learn more</button>
            </>
          )}
        </div>
      </div>

      <ResponseRateWidget state={state} tone="amber" qualifier="Annual is leaving gaps" />
    </CardChrome>
  );
}

// --- Improve (very-low response: < 30%) ----------------------------------

interface ImproveCardProps {
  state: AccountState;
  onDismiss: () => void;
}

function ImproveCard({ state, onDismiss }: ImproveCardProps) {
  const [context, setContext] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <CardChrome onDismiss={onDismiss}>
      <div className="home-nudge-card-main">
        <h3 className="home-nudge-headline">
          Improve your existing project before expanding listening
        </h3>
        <div className="home-nudge-sub home-nudge-sub-licensed">Included in your license</div>

        <p className="home-nudge-paragraph">
          Let's help you improve your existing project to make sure it meets best practices and
          aligns to norms, so we can reasonably expect the participation rate to meaningfully
          increase before you add new cadences.
        </p>

        {submitted ? (
          <div className="home-nudge-ack home-nudge-ack-block">
            <CheckCircle2 size={16} />
            Thanks. Your XM strategist will use this context to scope the review and reach out
            within 2 business days.
          </div>
        ) : (
          <>
            <div className="home-nudge-prompt">
              <label className="home-nudge-prompt-label">
                What do you think is driving low participation?{' '}
                <span className="home-nudge-prompt-optional">(optional)</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. comms team was understaffed this cycle, recent layoffs created hesitancy, survey URL had deliverability issues, mobile-first workforce needed SMS..."
                rows={3}
                className="home-nudge-prompt-textarea"
              />
            </div>

            <div className="home-nudge-ctas">
              <button
                className="home-nudge-cta-primary"
                onClick={() => setSubmitted(true)}
              >
                <Sparkles size={14} />
                Start improvement review
              </button>
              <button className="home-nudge-cta-secondary">Learn more</button>
            </div>
          </>
        )}
      </div>

      <ResponseRateWidget state={state} tone="red" qualifier="Below best-practice norms" />
    </CardChrome>
  );
}

// ---------------------------------------------------------------------------
// Widgets
// ---------------------------------------------------------------------------

type Tone = 'blue' | 'green' | 'amber' | 'red';

const TONE_RING: Record<Tone, string> = {
  blue: '#0077CC',
  green: '#10B981',
  amber: '#F59E0B',
  red: '#EF4444',
};

const TONE_CLASS: Record<Tone, string> = {
  blue: 'tone-blue',
  green: 'tone-green',
  amber: 'tone-amber',
  red: 'tone-red',
};

interface ResponseRateWidgetProps {
  state: AccountState;
  tone: Tone;
  qualifier: string;
}

function ResponseRateWidget({ state, tone, qualifier }: ResponseRateWidgetProps) {
  const pct = Math.round(state.engagePulseResponseRate * 100);
  const r = 46;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="home-nudge-widget">
      <div className="home-nudge-widget-label">Annual response rate</div>
      <div className="home-nudge-widget-svg">
        <svg width="124" height="124" viewBox="0 0 124 124">
          <circle cx="62" cy="62" r={r} stroke="#E5E7EB" strokeWidth="10" fill="none" />
          <circle
            cx="62"
            cy="62"
            r={r}
            stroke={TONE_RING[tone]}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 62 62)"
          />
          <text
            x="62"
            y="64"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="26"
            fontWeight="700"
            fill="#111827"
          >
            {pct}%
          </text>
        </svg>
      </div>
      <div className={`home-nudge-widget-qualifier ${TONE_CLASS[tone]}`}>{qualifier}</div>
      <div className="home-nudge-widget-sub">
        {state.engagePulseResponses.toLocaleString()} of {state.engagePulseInvited.toLocaleString()} responded
      </div>
    </div>
  );
}

interface PulseSampleWidgetProps {
  sampleSize: number;
  invited: number;
}

/**
 * Visualizes the Pulse sampling concept: a small slice of the total
 * population is invited each month, rotated so every employee is heard
 * over time. The arc represents ~5% of invited.
 */
function PulseSampleWidget({ sampleSize, invited }: PulseSampleWidgetProps) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const fraction = invited > 0 ? sampleSize / invited : 0;
  const dash = fraction * circ;

  return (
    <div className="home-nudge-widget">
      <div className="home-nudge-widget-label">Monthly Pulse sample</div>
      <div className="home-nudge-widget-svg">
        <svg width="124" height="124" viewBox="0 0 124 124">
          <circle cx="62" cy="62" r={r} stroke="#E5E7EB" strokeWidth="10" fill="none" />
          <circle
            cx="62"
            cy="62"
            r={r}
            stroke={TONE_RING.blue}
            strokeWidth="10"
            fill="none"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 62 62)"
          />
          <text
            x="62"
            y="58"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="22"
            fontWeight="700"
            fill="#111827"
          >
            ~{sampleSize.toLocaleString()}
          </text>
          <text
            x="62"
            y="78"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fill="#6B7280"
          >
            of {invited.toLocaleString()}/mo
          </text>
        </svg>
      </div>
      <div className="home-nudge-widget-qualifier tone-blue">Sampled, not full-population</div>
      <div className="home-nudge-widget-sub">Rotates so everyone is heard over time</div>
    </div>
  );
}
