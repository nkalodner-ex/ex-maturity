import { Search, MoreHorizontal, Plus, Users, RefreshCw, UserCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockProjects } from '../data/mockProjects';
import { generateGrowthActions } from '../data/maturityActions';
import { ProgramGrowthTab } from './ProgramGrowthTab';
import type { Project } from '../types';

interface ProgramOverviewProps {
  onSelectProject: (projectId: string) => void;
  onActionCta: (actionId: string) => void;
}

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

const KEY_METRICS = [
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
    label: 'Response Rate',
    value: '81%',
    change: '-2pts',
    trend: 'down' as const,
    sub: 'vs. 83% last cycle',
  },
  {
    label: 'Active Programs',
    value: '4',
    change: '+1',
    trend: 'up' as const,
    sub: 'Manager 360 launching soon',
  },
];

export function ProgramOverview({ onSelectProject, onActionCta }: ProgramOverviewProps) {
  const growthActions = generateGrowthActions(mockProjects);

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
          {mockProjects.map((project) => {
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
        {/* Key Metrics */}
        <div className="prog-metrics-section">
          <h2 className="prog-section-label">Program at a Glance</h2>
          <div className="prog-metrics-grid">
            {KEY_METRICS.map((m) => (
              <div key={m.label} className="prog-metric-card">
                <div className="prog-metric-value">{m.value}</div>
                <div className="prog-metric-label">{m.label}</div>
                <div className={`prog-metric-change trend-${m.trend}`}>
                  {m.trend === 'up' && <TrendingUp size={12} />}
                  {m.trend === 'down' && <TrendingDown size={12} />}
                  {m.trend === 'flat' && <Minus size={12} />}
                  {m.change}
                </div>
                <div className="prog-metric-sub">{m.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Growth */}
        <div className="prog-growth-section">
          <h2 className="prog-section-label">Program Growth Recommendations</h2>
          <ProgramGrowthTab actions={growthActions} onActionCta={onActionCta} />
        </div>
      </div>
    </div>
  );
}
