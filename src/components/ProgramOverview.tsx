import { useState } from 'react';
import { Search, MoreHorizontal, Plus, Users, RefreshCw, UserCheck, Sparkles, ArrowRight } from 'lucide-react';
import { deriveAccountState } from '../data/maturityActions';
import { HomeListeningNudge } from './HomeListeningNudge';
import type { Project } from '../types';

interface ProgramOverviewProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onActionCta: (actionId: string) => void;
  onNavigateToGrowth: () => void;
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

export function ProgramOverview({ projects, onSelectProject, onNavigateToGrowth }: ProgramOverviewProps) {
  const accountState = deriveAccountState(projects);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

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
        {/* Growth nudge — the only thing on the home today. Program at a
            Glance and the listening timeline moved to the EX Growth tab.
            Only listening-frequency recommendations elevate here; everything
            else lives on the EX Growth tab via the "See all" link. */}
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
