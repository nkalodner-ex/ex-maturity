import { FileText, MessageSquare, Calendar } from 'lucide-react';
import type { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

function getProjectTypeLabel(type: Project['type']): string {
  switch (type) {
    case 'employee_engagement':
      return 'Employee Engagement';
    case 'lifecycle':
      return 'Lifecycle';
    case 'customer_experience':
      return 'Customer Experience';
    default:
      return type;
  }
}

export function ProjectList({ projects, selectedProject, onSelectProject }: ProjectListProps) {
  return (
    <div className="q-project-list">
      {projects.map(project => (
        <div
          key={project.id}
          className={`q-card q-project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
          onClick={() => onSelectProject(project)}
        >
          <div className="q-project-header">
            <div className="q-project-name">{project.name}</div>
            {project.hasOpenEndedResponses && (
              <span className="q-badge q-badge-success">
                <MessageSquare size={10} style={{ marginRight: '4px' }} />
                Open-Ended
              </span>
            )}
          </div>
          <div className="q-project-meta">
            <span>
              <FileText size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {project.responseCount.toLocaleString()} responses
            </span>
            <span>
              <Calendar size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              {new Date(project.lastUpdated).toLocaleDateString()}
            </span>
          </div>
          <div style={{ marginTop: '8px' }}>
            <span className="q-badge q-badge-neutral">{getProjectTypeLabel(project.type)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
