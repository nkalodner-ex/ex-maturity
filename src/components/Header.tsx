import { BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeNav?: string;
}

export function Header({ activeNav = 'projects' }: HeaderProps) {
  return (
    <header className="q-header">
      <div className="q-header-logo">
        <BarChart3 size={28} />
        <span>Qualtrics XM</span>
      </div>
      <nav className="q-header-nav">
        <a
          href="#"
          className={`q-header-nav-item ${activeNav === 'projects' ? 'active' : ''}`}
        >
          Projects
        </a>
        <a
          href="#"
          className={`q-header-nav-item ${activeNav === 'data' ? 'active' : ''}`}
        >
          Data & Analysis
        </a>
        <a
          href="#"
          className={`q-header-nav-item ${activeNav === 'reports' ? 'active' : ''}`}
        >
          Reports
        </a>
        <a
          href="#"
          className={`q-header-nav-item ${activeNav === 'workflows' ? 'active' : ''}`}
        >
          Workflows
        </a>
      </nav>
    </header>
  );
}
