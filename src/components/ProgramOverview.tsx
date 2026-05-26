import { useState } from 'react';
import {
  Search,
  MoreHorizontal,
  Plus,
  Users,
  RefreshCw,
  UserCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { deriveAccountState } from '../data/maturityActions';
import { HomeListeningNudge } from './HomeListeningNudge';
import type { Project } from '../types';

interface ResponseRateMetric {
  value: string;
  change: string;
  trend: 'up' | 'down';
  sub: string;
}

interface ProgramOverviewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onActionCta: (actionId: string) => void;
  onNavigateToGrowth: () => void;
  /** Profile-driven response-rate metric for the Program at a Glance section. */
  responseRate?: ResponseRateMetric;
}

// Program at a Glance overview metrics. Response Rate is profile-driven (see
// the demo settings panel in App.tsx); the other three are hardcoded display
// text. If you change responseCount/invited in mockProjects directly without
// going through the demo profile, update the Response Rate fallback here too
// so the demo stays coherent.
const DEFAULT_RESPONSE_RATE: ResponseRateMetric = {
  value: '58%',
  change: '-7pts',
  trend: 'down',
  sub: 'vs. 65% last cycle',
};

const STATIC_METRICS = [
  {
    label: 'Survey Respondents',
    value: '3,095',
    change: '+12%',
    trend: 'up' as const,
    sub: 'across all active programs',
  },
  {
    label: 'Avg. Engagement Score',
    value: '74%',
    change: '+3pts',
    trend: 'up' as const,
    sub: 'vs. 71% last cycle',
  },
  {
    label: 'Active Programs',
    value: '4',
    change: '+1',
    trend: 'up' as const,
    sub: 'Manager 360 launching soon',
  },
];

const TYPE_ICON: Record<Project['type'], typeof Users> = {
  employee_engagement: Users,
  lifecycle: RefreshCw,
  customer_experience: Users,
  '360': UserCheck,
};

const STATUS_LABEL: Record<Project['status'], string> = {
  active: 'Active',
  new: 'New',
  closed: 'Closed',
};

const CLICKABLE_PROJECT_ID = 'employee_engagement';

export function ProgramOverview({
  projects,
  onSelectProject,
  onNavigateToGrowth,
  responseRate,
}: ProgramOverviewProps) {
  const accountState = deriveAccountState(projects);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Stitch the metric cards: keep the static three, insert the dynamic
  // Response Rate into its original third position.
  const rrCard = { label: 'Response Rate', ...(responseRate ?? DEFAULT_RESPONSE_RATE) };
  const keyMetrics = [STATIC_METRICS[0], STATIC_METRICS[1], rrCard, STATIC_METRICS[2]];

  return (
    <div className="prog-overview">
      {/* Left Sidebar */}
      <aside className="prog-sidebar">
        <div className="prog-sidebar-user">
          <div className="prog-sidebar-avatar">N</div>
          <div className="prog-sidebar-welcome">Welcome to XM</div>
        </div>

        <div className="prog-sidebar-search-wrap">
          <Search size={14} className="prog-sidebar-search-icon" />
          <input
            className="prog-sidebar-search"
            type="text"
            placeholder="Search by name, type, owner..."
            readOnly
          />
        </div>

        <div className="prog-sidebar-section-header">
          <span className="prog-sidebar-section-label">Recently visited</span>
          <button className="prog-sidebar-see-all">See all projects</button>
        </div>

        <div className="prog-project-list">
          {projects.map((project) => {
            const Icon = TYPE_ICON[project.type];
            const clickable = project.id === CLICKABLE_PROJECT_ID;
            return (
              <button
                key={project.id}
                className={`prog-project-card ${clickable ? 'clickable' : 'inert'}`}
                onClick={clickable ? () => onSelectProject(project.id) : undefined}
                disabled={!clickable}
              >
                <div className="prog-project-card-top">
                  <div className="prog-project-type-icon">
                    <Icon size={13} />
                  </div>
                  <span className="prog-project-name">{project.name}</span>
                  <MoreHorizontal size={16} className="prog-project-more" />
                </div>
                <div className="prog-project-card-bottom">
                  <span className="prog-project-meta">
                    {project.responseCount.toLocaleString()} Participants
                  </span>
                  <span className={`prog-project-status status-${project.status}`}>
                    {STATUS_LABEL[project.status]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="prog-sidebar-footer">
          <button className="prog-create-btn">
            <Plus size={16} />
            Create a new project
          </button>
        </div>
      </aside>

      {/* Right Content */}
      <div className="prog-content">
        {/* Program at a glance — overview metrics row */}
        <section className="prog-metrics-section">
          <h2 className="prog-section-label">Program at a glance</h2>
          <div className="prog-metrics-grid">
            {keyMetrics.map(m => (
              <div key={m.label} className="prog-metric-card">
                <div className="prog-metric-value">{m.value}</div>
                <div className="prog-metric-label">{m.label}</div>
                <div className={`prog-metric-change trend-${m.trend}`}>
                  {m.trend === 'up' && <TrendingUp size={12} />}
                  {m.trend === 'down' && <TrendingDown size={12} />}
                  {m.change}
                </div>
                <div className="prog-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Growth nudge. Only listening-frequency recommendations elevate
            here; everything else lives on the EX Growth tab via the
            "See all" link. */}
        {!nudgeDismissed && (
          <div className="prog-growth-section">
            <div className="home-growth-header">
              <div className="home-growth-title">
                <h2 className="prog-section-label">Growth</h2>
                <span className="home-growth-badge">
                  <Sparkles size={11} />
                  Personalized for you
                </span>
              </div>
              <button className="home-growth-see-all" onClick={onNavigateToGrowth}>
                See all recommendations
                <ArrowRight size={13} />
              </button>
            </div>
            <HomeListeningNudge
              state={accountState}
              onDismiss={() => setNudgeDismissed(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
