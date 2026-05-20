import { useMemo } from 'react';
import { Users, Activity } from 'lucide-react';
import type { Project, ProjectSchedule } from '../types';

/**
 * Annual listening timeline for the EX Growth tab.
 *
 * Renders a 12-month calendar strip (Jan -> Dec) with each cadenced listening
 * program placed at the month(s) it sends.
 *
 * Scope is intentionally narrow: engagement + Pulse only. Lifecycle is
 * assumed to be always-on (auto-triggered from HRIS) and 360 is a different
 * kind of program with its own schedule logic, so neither is plotted here.
 *
 * Items are clickable; clicking the annual engagement project routes into
 * its project view (parent decides via onSelectProject). Other projects are
 * inert and show a subtle hover state.
 */

interface AnnualTimelineProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  /** id of the project the parent currently treats as clickable. */
  clickableProjectId?: string;
}

const MONTH_LABELS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface RowStyle {
  /** Color of the marker / stripe. */
  color: string;
  /** Background tint of the row card. */
  bg: string;
  /** Short label shown above the project name. */
  kindLabel: string;
}

function styleFor(project: Project): RowStyle {
  if (project.programKind === 'pulse') {
    return { color: '#6B47DC', bg: '#F3EFFC', kindLabel: 'Pulse' };
  }
  // engagement (default for employee_engagement)
  return { color: '#0077CC', bg: '#EBF4FF', kindLabel: 'Engagement' };
}

/**
 * Return the list of months (0-11) on which a schedule sends, plus a flag for
 * 'continuous' which renders as a stripe across the whole year.
 */
function scheduleToMonths(schedule: ProjectSchedule): { months: number[]; stripe: boolean } {
  if (schedule.cadence === 'continuous') {
    return { months: [], stripe: true };
  }
  const anchor = (schedule.anchorMonth ?? 1) - 1; // 0-indexed
  switch (schedule.cadence) {
    case 'annual':
      return { months: [anchor], stripe: false };
    case 'biannual':
      return { months: [anchor, (anchor + 6) % 12], stripe: false };
    case 'quarterly':
      return {
        months: [0, 3, 6, 9].map(o => (anchor + o) % 12),
        stripe: false,
      };
    case 'monthly':
      return { months: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], stripe: false };
    case 'one-time':
      return { months: [anchor], stripe: false };
  }
}

function describeSchedule(schedule: ProjectSchedule): string {
  const day = schedule.day;
  const monthName = schedule.anchorMonth ? MONTH_NAMES[schedule.anchorMonth - 1] : undefined;
  const ord = day ? ordinal(day) : '';
  switch (schedule.cadence) {
    case 'annual':
      return monthName ? `Annual, sends ${monthName} ${day ?? 1}` : 'Annual';
    case 'biannual':
      return monthName ? `Biannual, anchored on ${monthName} ${day ?? 1}` : 'Biannual';
    case 'quarterly':
      return monthName ? `Quarterly, anchored on ${monthName} ${day ?? 1}` : 'Quarterly';
    case 'monthly':
      return day ? `Monthly, sends the ${ord}` : 'Monthly';
    case 'continuous':
      return 'Always on (auto-triggered from HRIS)';
    case 'one-time':
      return monthName ? `One-time launch, ${monthName} ${day ?? 1}` : 'One-time launch';
  }
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function AnnualTimeline({ projects, onSelectProject, clickableProjectId }: AnnualTimelineProps) {
  // Engagement + Pulse only. Lifecycle is assumed always-on; 360 runs on its
  // own cycle and isn't part of the engagement / pulse cadence picture.
  // Closed projects and projects without a schedule are filtered out.
  const rows = useMemo(
    () =>
      projects.filter(
        p =>
          p.schedule &&
          p.status !== 'closed' &&
          p.type === 'employee_engagement',
      ),
    [projects],
  );

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="atl-card">
      <div className="atl-header">
        <h2 className="prog-section-label">Listening timeline</h2>
        <p className="atl-subtitle">
          Where each program lands across the year. Click a survey to manage questions,
          cadence, or skip a send.
        </p>
      </div>

      {/* Month axis */}
      <div className="atl-grid">
        <div className="atl-axis">
          <div className="atl-axis-spacer" />
          <div className="atl-axis-months">
            {MONTH_LABELS.map((m, i) => (
              <div key={i} className="atl-axis-month">
                <span className="atl-axis-month-letter">{m}</span>
                <span className="atl-axis-month-name">{MONTH_NAMES[i].slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Each project row */}
        {rows.map(project => {
          const style = styleFor(project);
          const sched = project.schedule!;
          const { months, stripe } = scheduleToMonths(sched);
          const isClickable = project.id === clickableProjectId;
          const summary = describeSchedule(sched);

          return (
            <div key={project.id} className="atl-row">
              {/* Label cell */}
              <button
                className={`atl-row-label ${isClickable ? 'clickable' : 'inert'}`}
                onClick={isClickable ? () => onSelectProject(project.id) : undefined}
                disabled={!isClickable}
                style={{ background: style.bg }}
                aria-label={`${project.name} — ${summary}`}
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

              {/* 12-month track */}
              <div className="atl-track">
                {Array.from({ length: 12 }).map((_, m) => (
                  <div key={m} className="atl-track-cell" />
                ))}

                {/* Continuous stripe */}
                {stripe && (
                  <div
                    className="atl-stripe"
                    style={{ background: style.color }}
                    title={summary}
                  >
                    <Activity size={11} />
                    <span>Always on</span>
                  </div>
                )}

                {/* Per-month markers */}
                {!stripe && months.map((monthIdx, i) => {
                  // Position marker at the day-of-month within the cell
                  const day = sched.day ?? 1;
                  const dayOffset = ((day - 1) / 30) * 100; // 0-100% within the cell
                  return (
                    <button
                      key={`${project.id}-${monthIdx}-${i}`}
                      className={`atl-marker ${isClickable ? 'clickable' : 'inert'}`}
                      onClick={isClickable ? () => onSelectProject(project.id) : undefined}
                      disabled={!isClickable}
                      style={{
                        left: `calc(${(monthIdx / 12) * 100}% + ${dayOffset / 12}%)`,
                        background: style.color,
                      }}
                      title={`${project.name} — ${MONTH_NAMES[monthIdx]} ${day}`}
                      aria-label={`${project.name} sends ${MONTH_NAMES[monthIdx]} ${day}`}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="atl-legend">
        <span className="atl-legend-item">
          <span className="atl-legend-dot" style={{ background: '#0077CC' }} />
          Engagement
        </span>
        <span className="atl-legend-item">
          <span className="atl-legend-dot" style={{ background: '#6B47DC' }} />
          Pulse
        </span>
        <span className="atl-legend-item atl-legend-note">
          Lifecycle is assumed always-on; 360 runs on its own cycle.
        </span>
      </div>
    </div>
  );
}
