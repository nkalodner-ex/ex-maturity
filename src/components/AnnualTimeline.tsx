import { Fragment, useMemo, useState, useRef, useEffect, useCallback } from 'react';
import {
  Users,
  Activity,
  ChevronRight,
  ChevronDown,
  X,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  Edit3,
  SkipForward,
  AlertTriangle,
} from 'lucide-react';
import type { Project, ProjectSchedule, SendState } from '../types';

// ── Constants ─────────────────────────────────────────────────────────────────

const SURVEY_WINDOW_DAYS = 14;
const TREND_THRESHOLD = 2;
// The year this timeline displays. When year navigation is added, make this a
// prop. The today-line is hidden when today's year does not match TIMELINE_YEAR.
const TIMELINE_YEAR = new Date().getFullYear();

// Stable reference to "now" for the lifetime of this module load.
const TODAY = new Date();

// ── Month data ─────────────────────────────────────────────────────────────────

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Interfaces ─────────────────────────────────────────────────────────────────

interface AnnualTimelineProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  clickableProjectId?: string;
}

interface RowStyle {
  color: string;
  bg: string;
  kindLabel: string;
}

interface SelectedSend {
  projectId: string;
  monthIdx: number;
  sendState: SendState;
  /** If set, show the question trend view instead of the send overview. */
  questionKey?: string;
}

// ── Row styling ────────────────────────────────────────────────────────────────

function styleFor(project: Project): RowStyle {
  if (project.programKind === 'pulse') {
    return { color: '#6B47DC', bg: '#F3EFFC', kindLabel: 'Pulse' };
  }
  return { color: '#0077CC', bg: '#EBF4FF', kindLabel: 'Engagement' };
}

// ── Schedule helpers ───────────────────────────────────────────────────────────

function scheduleToMonths(schedule: ProjectSchedule): { months: number[]; stripe: boolean } {
  if (schedule.cadence === 'continuous') return { months: [], stripe: true };
  const anchor = (schedule.anchorMonth ?? 1) - 1;
  switch (schedule.cadence) {
    case 'annual':    return { months: [anchor], stripe: false };
    case 'biannual':  return { months: [anchor, (anchor + 6) % 12], stripe: false };
    case 'quarterly': return { months: [0, 3, 6, 9].map(o => (anchor + o) % 12), stripe: false };
    case 'monthly':   return { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], stripe: false };
    case 'one-time':  return { months: [anchor], stripe: false };
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function describeSchedule(schedule: ProjectSchedule): string {
  const day = schedule.day;
  const monthName = schedule.anchorMonth ? MONTH_NAMES[schedule.anchorMonth - 1] : undefined;
  const ord = day ? ordinal(day) : '';
  switch (schedule.cadence) {
    case 'annual':    return monthName ? `Annual, sends ${monthName} ${day ?? 1}` : 'Annual';
    case 'biannual':  return monthName ? `Biannual, anchored on ${monthName} ${day ?? 1}` : 'Biannual';
    case 'quarterly': return monthName ? `Quarterly, anchored on ${monthName} ${day ?? 1}` : 'Quarterly';
    case 'monthly':   return day ? `Monthly, sends the ${ord}` : 'Monthly';
    case 'continuous':return 'Always on (auto-triggered from HRIS)';
    case 'one-time':  return monthName ? `One-time launch, ${monthName} ${day ?? 1}` : 'One-time launch';
  }
}

// ── Send-state helpers ─────────────────────────────────────────────────────────

function getSendState(monthIdx: number, day: number): SendState {
  const sendDate  = new Date(TIMELINE_YEAR, monthIdx, day);
  const closeDate = new Date(TIMELINE_YEAR, monthIdx, day + SURVEY_WINDOW_DAYS);
  if (TODAY > closeDate)  return 'closed';
  if (TODAY >= sendDate)  return 'in-flight';
  return 'upcoming';
}

/**
 * Returns today's position as a 0-100% value across the year.
 * Day is offset by -1 so day 1 sits at the start of the month column,
 * not one day's-worth into it (day 1 of 31 → 0%, day 31 → ~97%).
 */
function getTodayPercent(): number {
  const m = TODAY.getMonth();
  const d = TODAY.getDate();
  const daysInMonth = new Date(TIMELINE_YEAR, m + 1, 0).getDate();
  return ((m + (d - 1) / daysInMonth) / 12) * 100;
}

/** Absolute-position left value for a marker at monthIdx / day within an atl-track. */
function markerLeft(monthIdx: number, day: number): string {
  const dayOffset = ((day - 1) / 30) * 100;
  return `calc(${(monthIdx / 12) * 100}% + ${(dayOffset / 12).toFixed(3)}%)`;
}

function computeTrend(current: number, prev: number | undefined): 'up' | 'down' | 'flat' {
  if (prev === undefined) return 'flat';
  const delta = current - prev;
  if (delta >= TREND_THRESHOLD)  return 'up';
  if (delta <= -TREND_THRESHOLD) return 'down';
  return 'flat';
}

// ── Mock content for panel views ───────────────────────────────────────────────

const CLOSED_MOVERS = [
  { theme: 'Work-life balance',    score: 68, delta: +3 },
  { theme: 'Productivity & tools', score: 74, delta: +1 },
  { theme: 'Team collaboration',   score: 69, delta: -2 },
] as const;

const IN_FLIGHT_SIGNALS = [
  { type: 'warn',  text: 'Response rate below 60% target' },
  { type: 'trend', text: 'Team collaboration trending below prior cycle' },
] as const;

// ── Panel content sub-components ──────────────────────────────────────────────

function ClosedContent({ project, monthIdx }: { project: Project; monthIdx: number }) {
  const overall = project.responseCount && project.invited
    ? Math.round((project.responseCount / project.invited) * 100)
    : 70;
  // Monthly pulse sends have known per-send response rates (high, short survey).
  const PULSE_RATES: Record<number, number> = { 0: 88, 1: 84, 2: 91, 3: 87 };
  const displayRate = project.programKind === 'pulse'
    ? (PULSE_RATES[monthIdx] ?? overall)
    : overall;
  const prevRate = displayRate - 5;
  const target   = project.programKind === 'pulse' ? 75 : 60;

  return (
    <>
      <div className="atl-panel-section">
        <span className="atl-panel-section-label">Response rate</span>
        <div className="atl-panel-rr-row">
          <span className="atl-panel-rr-value">{displayRate}%</span>
          <div className="atl-panel-progress-bar">
            <div className="atl-panel-progress-fill" style={{ width: `${Math.min(displayRate, 100)}%` }} />
          </div>
          <span className={`atl-panel-rr-tag ${displayRate >= target ? 'good' : 'warn'}`}>
            {displayRate >= target ? 'Above' : 'Below'} {target}% target
          </span>
        </div>
      </div>

      <div className="atl-panel-section">
        <span className="atl-panel-section-label">Top movers</span>
        <table className="atl-panel-table">
          <tbody>
            {CLOSED_MOVERS.map(m => (
              <tr key={m.theme}>
                <td className="atl-panel-td-theme">{m.theme}</td>
                <td className="atl-panel-td-score">{m.score}%</td>
                <td className={`atl-panel-delta ${m.delta >= TREND_THRESHOLD ? 'up' : m.delta <= -TREND_THRESHOLD ? 'down' : 'flat'}`}>
                  {m.delta > 0 ? '+' : ''}{m.delta}pts
                  {m.delta >= TREND_THRESHOLD && <TrendingUp size={10} />}
                  {m.delta <= -TREND_THRESHOLD && <TrendingDown size={10} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="atl-panel-section">
        <span className="atl-panel-section-label">Comparison to prior cycle</span>
        <div className="atl-panel-comparison">
          <span>This cycle: <strong>{displayRate}%</strong></span>
          <span className="atl-panel-comparison-sep">·</span>
          <span>Prior: <strong>{prevRate}%</strong></span>
          <span className={`atl-panel-delta ${displayRate > prevRate ? 'up' : 'down'}`}>
            {displayRate > prevRate ? '+' : ''}{displayRate - prevRate}pts
            {displayRate > prevRate ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          </span>
        </div>
      </div>

      <button className="atl-panel-cta-btn">View full report</button>
    </>
  );
}

function InFlightContent({ monthIdx, day }: { monthIdx: number; day: number }) {
  const sendDate   = new Date(TIMELINE_YEAR, monthIdx, day);
  const daysElapsed = Math.floor((TODAY.getTime() - sendDate.getTime()) / 86400000);
  const daysLeft   = Math.max(0, SURVEY_WINDOW_DAYS - daysElapsed);
  const partialRate = 52;
  const target      = 60;

  return (
    <>
      <div className="atl-panel-section">
        <span className="atl-panel-section-label">Current response rate</span>
        <div className="atl-panel-rr-row">
          <span className="atl-panel-rr-value">{partialRate}%</span>
          <div className="atl-panel-progress-bar">
            <div className="atl-panel-progress-fill atl-panel-progress-fill--partial"
                 style={{ width: `${partialRate}%` }} />
          </div>
          <span className="atl-panel-rr-tag warn">Target: {target}%</span>
        </div>
        <p className="atl-panel-rr-sub">
          {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining in window
        </p>
      </div>

      <div className="atl-panel-section">
        <span className="atl-panel-section-label">Early signals</span>
        <ul className="atl-panel-signals">
          {IN_FLIGHT_SIGNALS.map((s, i) => (
            <li key={i} className={`atl-panel-signal atl-panel-signal--${s.type}`}>
              {s.type === 'warn'
                ? <AlertTriangle size={11} />
                : <TrendingDown size={11} />}
              {s.text}
            </li>
          ))}
        </ul>
      </div>

      <button className="atl-panel-cta-btn">View live results</button>
    </>
  );
}

function UpcomingContent({ project, monthIdx }: { project: Project; monthIdx: number }) {
  const sched    = project.schedule!;
  const day      = sched.day ?? 1;
  const sendDate = new Date(TIMELINE_YEAR, monthIdx, day);
  const daysUntil = Math.max(0, Math.ceil((sendDate.getTime() - TODAY.getTime()) / 86400000));
  const audience  = project.invited ?? project.responseCount;

  return (
    <>
      <div className="atl-panel-section">
        <div className="atl-panel-section-hdr">
          <span className="atl-panel-section-label">Questions</span>
          <button className="atl-panel-edit-link"><Edit3 size={11} /> Edit</button>
        </div>
        {project.questionHistory && project.questionHistory.length > 0 ? (
          <ul className="atl-panel-q-list">
            {project.questionHistory.map(q => (
              <li key={q.key} className="atl-panel-q-item">
                <span className="atl-panel-q-bullet" aria-hidden="true">□</span>
                {q.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="atl-panel-empty">No questions configured yet.</p>
        )}
      </div>

      <div className="atl-panel-section">
        <div className="atl-panel-section-hdr">
          <span className="atl-panel-section-label">Audience</span>
          <button className="atl-panel-edit-link"><Edit3 size={11} /> Edit</button>
        </div>
        <p className="atl-panel-meta-text">
          {audience > 0 ? `${audience.toLocaleString()} employees targeted` : 'No audience configured'}
        </p>
      </div>

      <div className="atl-panel-section">
        <div className="atl-panel-section-hdr">
          <span className="atl-panel-section-label">Schedule</span>
          <button className="atl-panel-edit-link"><Edit3 size={11} /> Edit</button>
        </div>
        <p className="atl-panel-meta-text">
          {describeSchedule(sched)}
          <br />
          <span className="atl-panel-days-until">
            Sends in {daysUntil} day{daysUntil !== 1 ? 's' : ''}
          </span>
        </p>
      </div>

      <div className="atl-panel-actions">
        <button className="atl-panel-action-btn">Adjust questions</button>
        <button className="atl-panel-action-btn">Edit schedule</button>
        <button className="atl-panel-action-btn atl-panel-action-btn--danger">
          <SkipForward size={12} />
          Skip this send
        </button>
      </div>
    </>
  );
}

// ── SendPanel ─────────────────────────────────────────────────────────────────

interface SendPanelProps {
  rows: Project[];
  selectedSend: SelectedSend;
  onClose: () => void;
}

function SendPanel({ rows, selectedSend, onClose }: SendPanelProps) {
  const { projectId, monthIdx, sendState, questionKey } = selectedSend;
  const project = rows.find(p => p.id === projectId);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => { closeRef.current?.focus(); }, []);

  if (!project?.schedule) return null;

  const day      = project.schedule.day ?? 1;
  const sendDate = `${MONTH_NAMES[monthIdx]} ${day}, ${TIMELINE_YEAR}`;

  // Question trend view — shown when a closed question chip is clicked
  if (questionKey) {
    const question = project.questionHistory?.find(q => q.key === questionKey);
    if (!question) return null;
    const closedResults = question.results.filter(
      r => r.value !== null && getSendState(r.monthIdx, day) === 'closed',
    );
    return (
      <div className="atl-panel" role="dialog" aria-modal="true"
           aria-label={`Trend — ${question.text}`}>
        <div className="atl-panel-header">
          <span className="atl-panel-title atl-panel-title--small">{question.text}</span>
          <button className="atl-panel-close" onClick={onClose} ref={closeRef}
                  aria-label="Close panel">
            <X size={16} />
          </button>
        </div>
        <div className="atl-panel-body">
          <span className="atl-panel-section-label">Score over time</span>
          <table className="atl-panel-table atl-panel-trend-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Score</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {closedResults.map((r, idx) => {
                const prev  = closedResults[idx - 1];
                const delta = prev?.value != null && r.value != null
                  ? r.value - prev.value : null;
                const dir   = delta != null ? computeTrend(r.value!, prev?.value ?? undefined) : 'flat';
                return (
                  <tr key={r.monthIdx}>
                    <td>{MONTH_NAMES[r.monthIdx].slice(0, 3)}</td>
                    <td><strong>{r.value}%</strong></td>
                    <td className={`atl-panel-delta ${dir}`}>
                      {delta != null ? `${delta > 0 ? '+' : ''}${delta}pts` : '—'}
                      {dir === 'up'   && <TrendingUp size={10} />}
                      {dir === 'down' && <TrendingDown size={10} />}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const STATE_META = {
    closed:     { label: 'Completed',           cls: 'closed',     icon: <CheckCircle2 size={12} /> },
    'in-flight':{ label: 'Currently listening', cls: 'in-flight',  icon: <Activity size={12} /> },
    upcoming:   { label: 'Upcoming',            cls: 'upcoming',   icon: <Clock size={12} /> },
  } as const;
  const meta = STATE_META[sendState];

  return (
    <div className="atl-panel" role="dialog" aria-modal="true"
         aria-label={`${project.name} — ${sendDate}`}>
      <div className="atl-panel-header">
        <span className="atl-panel-title">{project.name}</span>
        <button className="atl-panel-close" onClick={onClose} ref={closeRef}
                aria-label="Close panel">
          <X size={16} />
        </button>
      </div>

      <div className="atl-panel-date-row">
        <span className={`atl-panel-badge atl-panel-badge--${meta.cls}`}>
          {meta.icon}
          {meta.label}
        </span>
        <span className="atl-panel-send-date">{sendDate}</span>
      </div>

      <div className="atl-panel-body">
        {sendState === 'closed'     && <ClosedContent    project={project} monthIdx={monthIdx} />}
        {sendState === 'in-flight'  && <InFlightContent  monthIdx={monthIdx} day={day} />}
        {sendState === 'upcoming'   && <UpcomingContent  project={project} monthIdx={monthIdx} />}
      </div>
    </div>
  );
}

// ── AnnualTimeline ─────────────────────────────────────────────────────────────

export function AnnualTimeline({ projects, onSelectProject, clickableProjectId }: AnnualTimelineProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedSend, setSelectedSend] = useState<SelectedSend | null>(null);
  const lastFocusedRef = useRef<Element | null>(null);

  // Today-line refs — x position is measured from the DOM so it stays correct
  // at all responsive breakpoints without hardcoding the label column width.
  const gridWrapperRef = useRef<HTMLDivElement>(null);
  const axisMonthsRef  = useRef<HTMLDivElement>(null);
  const [todayLineX, setTodayLineX] = useState<number | null>(null);

  const todayPercent  = useMemo(() => getTodayPercent(), []);
  const showTodayLine = TIMELINE_YEAR === TODAY.getFullYear();

  useEffect(() => {
    if (!showTodayLine) return;
    function measure() {
      if (!axisMonthsRef.current || !gridWrapperRef.current) return;
      const axisRect    = axisMonthsRef.current.getBoundingClientRect();
      const wrapperRect = gridWrapperRef.current.getBoundingClientRect();
      const trackLeft   = axisRect.left - wrapperRect.left;
      setTodayLineX(trackLeft + (todayPercent / 100) * axisRect.width);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (gridWrapperRef.current) ro.observe(gridWrapperRef.current);
    return () => ro.disconnect();
  }, [showTodayLine, todayPercent]);

  const openSend = useCallback((payload: SelectedSend) => {
    lastFocusedRef.current = document.activeElement;
    setSelectedSend(payload);
  }, []);

  const closeSend = useCallback(() => {
    setSelectedSend(null);
    (lastFocusedRef.current as HTMLElement | null)?.focus();
  }, []);

  // ESC closes the panel and returns focus to the triggering marker.
  useEffect(() => {
    if (!selectedSend) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSend(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selectedSend, closeSend]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const rows = useMemo(
    () => projects.filter(p => p.schedule && p.status !== 'closed' && p.type === 'employee_engagement'),
    [projects],
  );

  if (rows.length === 0) return null;

  return (
    <div className="atl-card">
      <div className="atl-header">
        <h2 className="prog-section-label">Listening timeline</h2>
        <p className="atl-subtitle">
          Where each program lands across the year. Click any send to drill in: review
          results from past sends, monitor in-flight progress, or edit upcoming sends
          before they launch.
        </p>
      </div>

      {/* Grid wrapper — today line is positioned absolutely within this */}
      <div className="atl-grid-wrapper" ref={gridWrapperRef}>
        {showTodayLine && todayLineX !== null && (
          <div className="atl-today-line" style={{ left: todayLineX }} aria-hidden="true">
            <div className="atl-today-pill">
              Today · {TODAY.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}

        <div className="atl-grid">
          {/* Month axis */}
          <div className="atl-axis">
            <div className="atl-axis-spacer" />
            <div className="atl-axis-months" ref={axisMonthsRef}>
              {MONTH_LABELS.map((m, i) => (
                <div key={i} className="atl-axis-month">
                  <span className="atl-axis-month-letter">{m}</span>
                  <span className="atl-axis-month-name">{MONTH_NAMES[i].slice(0, 3)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program rows */}
          {rows.map(project => {
            const style       = styleFor(project);
            const sched       = project.schedule!;
            const { months, stripe } = scheduleToMonths(sched);
            const isClickable = project.id === clickableProjectId;
            const isExpanded  = expandedRows.has(project.id);
            const hasQ        = (project.questionHistory?.length ?? 0) > 0;
            const summary     = describeSchedule(sched);
            const day         = sched.day ?? 1;

            return (
              <Fragment key={project.id}>
                {/* Main program row */}
                <div className="atl-row">
                  {/* Label cell — div wrapper prevents nested-button HTML invalidity */}
                  <div
                    className={`atl-row-label ${isClickable ? 'clickable' : 'inert'}`}
                    style={{ background: style.bg }}
                  >
                    {/* Navigate-to-project button (or static div for inert rows) */}
                    {isClickable ? (
                      <button
                        className="atl-row-label-content"
                        onClick={() => onSelectProject(project.id)}
                        aria-label={`${project.name} — ${summary}. Go to project.`}
                      >
                        <div className="atl-row-label-top">
                          <span className="atl-row-icon" style={{ color: style.color }}>
                            <Users size={13} />
                          </span>
                          <span className="atl-row-kind" style={{ color: style.color }}>
                            {style.kindLabel}
                          </span>
                        </div>
                        <div className="atl-row-name">{project.name}</div>
                        <div className="atl-row-meta">{summary}</div>
                      </button>
                    ) : (
                      <div className="atl-row-label-content">
                        <div className="atl-row-label-top">
                          <span className="atl-row-icon" style={{ color: style.color }}>
                            <Users size={13} />
                          </span>
                          <span className="atl-row-kind" style={{ color: style.color }}>
                            {style.kindLabel}
                          </span>
                        </div>
                        <div className="atl-row-name">{project.name}</div>
                        <div className="atl-row-meta">{summary}</div>
                      </div>
                    )}

                    {/* Expand/collapse button for programs with question history */}
                    {hasQ && (
                      <button
                        className="atl-expand-btn"
                        onClick={() => toggleExpand(project.id)}
                        aria-expanded={isExpanded}
                        aria-controls={`atl-questions-${project.id}`}
                        title={isExpanded ? 'Collapse questions' : 'Expand questions'}
                        aria-label={isExpanded ? 'Collapse questions' : 'Expand questions'}
                      >
                        {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                      </button>
                    )}
                  </div>

                  {/* 12-month track */}
                  <div className="atl-track">
                    {Array.from({ length: 12 }).map((_, m) => (
                      <div key={m} className="atl-track-cell" />
                    ))}

                    {stripe && (
                      <div className="atl-stripe" style={{ background: style.color }} title={summary}>
                        <Activity size={11} />
                        <span>Always on</span>
                      </div>
                    )}

                    {!stripe && months.map((monthIdx, i) => {
                      const sendState = getSendState(monthIdx, day);
                      const bgColor   = sendState === 'closed'
                        ? style.color + '99'
                        : sendState === 'upcoming'
                        ? 'transparent'
                        : style.color;
                      const borderExtra = sendState === 'upcoming'
                        ? { borderColor: style.color, borderStyle: 'dashed' as const }
                        : {};
                      const stateLabel = sendState === 'closed'
                        ? 'Completed'
                        : sendState === 'in-flight'
                        ? 'Currently listening'
                        : 'Upcoming';
                      const tipMetric = sendState === 'closed'
                        ? (project.responseCount && project.invited
                          ? `${Math.round((project.responseCount / project.invited) * 100)}% response rate`
                          : 'View results')
                        : sendState === 'in-flight'
                        ? `${Math.max(0, SURVEY_WINDOW_DAYS - Math.floor((TODAY.getTime() - new Date(TIMELINE_YEAR, monthIdx, day).getTime()) / 86400000))} days remaining`
                        : `In ${Math.max(0, Math.ceil((new Date(TIMELINE_YEAR, monthIdx, day).getTime() - TODAY.getTime()) / 86400000))} days`;

                      return (
                        <button
                          key={`${project.id}-${monthIdx}-${i}`}
                          className={`atl-marker atl-marker--${sendState}`}
                          onClick={() => openSend({ projectId: project.id, monthIdx, sendState })}
                          style={{
                            left: markerLeft(monthIdx, day),
                            background: bgColor,
                            borderColor: borderExtra.borderColor,
                            borderStyle: borderExtra.borderStyle,
                          }}
                          title={`${MONTH_NAMES[monthIdx]} ${day} — ${stateLabel} — ${tipMetric}`}
                          aria-label={`${project.name}, ${MONTH_NAMES[monthIdx]} ${day}. ${stateLabel}. ${tipMetric}. Click for details.`}
                        >
                          {/* Ring color is passed inline so it inherits the program color */}
                          {sendState === 'in-flight' && (
                            <span
                              className="atl-marker-ring"
                              style={{ borderColor: style.color }}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Question sub-rows — shown when the row is expanded */}
                {isExpanded && project.questionHistory && project.questionHistory.length > 0 && (
                  <div className="atl-sub-rows" id={`atl-questions-${project.id}`}>
                    {project.questionHistory.map(question => (
                      <div key={question.key} className="atl-sub-row">
                        <div className="atl-sub-label" title={question.text}>
                          {question.text}
                        </div>

                        <div className="atl-track atl-track--sub">
                          {Array.from({ length: 12 }).map((_, m) => (
                            <div key={m} className="atl-track-cell" />
                          ))}

                          {question.results.map(result => {
                            if (!result.included) return null;
                            const chipState = getSendState(result.monthIdx, day);

                            if (chipState === 'upcoming') {
                              return (
                                <span
                                  key={result.monthIdx}
                                  className="atl-q-chip atl-q-chip--upcoming"
                                  style={{
                                    left: markerLeft(result.monthIdx, day),
                                    borderColor: style.color,
                                  }}
                                  aria-hidden="true"
                                  title={`${MONTH_NAMES[result.monthIdx]}: scheduled`}
                                />
                              );
                            }

                            if (chipState === 'in-flight') {
                              return (
                                <span
                                  key={result.monthIdx}
                                  className="atl-q-chip atl-q-chip--in-flight"
                                  style={{
                                    left: markerLeft(result.monthIdx, day),
                                    background: style.color + '66',
                                    color: style.color,
                                  }}
                                  aria-hidden="true"
                                  title={`${MONTH_NAMES[result.monthIdx]}: collecting`}
                                >
                                  –
                                </span>
                              );
                            }

                            // closed — only interactive chips (value available)
                            if (result.value === null) return null;

                            const prevResult = question.results
                              .filter(r => r.included && r.value !== null && r.monthIdx < result.monthIdx)
                              .at(-1);
                            const trend = computeTrend(result.value, prevResult?.value ?? undefined);

                            return (
                              <button
                                key={result.monthIdx}
                                className="atl-q-chip atl-q-chip--closed"
                                style={{
                                  left: markerLeft(result.monthIdx, day),
                                  background: style.color,
                                }}
                                onClick={() => openSend({
                                  projectId: project.id,
                                  monthIdx: result.monthIdx,
                                  sendState: 'closed',
                                  questionKey: question.key,
                                })}
                                title={`${question.text} — ${MONTH_NAMES[result.monthIdx]}: ${result.value}%`}
                                aria-label={`${question.text}, ${MONTH_NAMES[result.monthIdx]}: ${result.value}%. View trend.`}
                              >
                                <span className="atl-q-value">{result.value}%</span>
                                {trend !== 'flat' && (
                                  <span className="atl-q-trend" aria-hidden="true">
                                    {trend === 'up'
                                      ? <TrendingUp size={8} />
                                      : <TrendingDown size={8} />}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* Legend — send-state key only. Program-type colors (Engagement vs
          Pulse) are clear enough from the timeline itself. */}
      <div className="atl-legend">
        <span className="atl-legend-item">
          <span className="atl-legend-state atl-legend-state--closed" />
          Completed
        </span>
        <span className="atl-legend-item">
          <span className="atl-legend-state atl-legend-state--in-flight" />
          In-flight
        </span>
        <span className="atl-legend-item">
          <span className="atl-legend-state atl-legend-state--upcoming" />
          Upcoming
        </span>
        <span className="atl-legend-note">
          Lifecycle is assumed always-on; 360 runs on its own cycle.
        </span>
      </div>

      {/* Send panel + backdrop */}
      {selectedSend && (
        <>
          {/* Backdrop — z-index 55, below panel at 60.
              The demo banner is in normal document flow (not fixed/sticky) and
              scrolls out of view before users reach the timeline, so z-index 60
              does not interfere with it in practice. Both values stay below
              the modal overlay at 1000. */}
          <div
            className="atl-panel-backdrop"
            onClick={closeSend}
            aria-hidden="true"
          />
          <SendPanel
            rows={rows}
            selectedSend={selectedSend}
            onClose={closeSend}
          />
        </>
      )}
    </div>
  );
}
