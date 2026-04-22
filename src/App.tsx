import { useState } from 'react';
import {
  Menu,
  ChevronDown,
  HelpCircle,
  Bell,
  Grid3X3,
  CheckCircle2,
} from 'lucide-react';
import { mockProjects } from './data/mockProjects';
import { ProgramOverview } from './components/ProgramOverview';
import './styles/qualtrics.css';

const ACTIVE_PROJECT = mockProjects.find(p => p.id === 'employee_engagement')!;

function App() {
  const [view, setView] = useState<'home' | 'project'>('home');

  const handleSelectProject = (projectId: string) => {
    if (projectId === 'employee_engagement') {
      setView('project');
    }
  };

  const handleActionCta = (_actionId: string) => {};

  const handleGoHome = () => {
    setView('home');
  };

  return (
    <div>
      {/* Demo Banner */}
      <div className="demo-banner">
        <span className="demo-banner-label">THIS IS A DEMO</span>
        <span className="demo-banner-sep">·</span>
        <span>Please see the </span>
        <a
          className="demo-banner-link"
          href="https://docs.google.com/document/d/1XdhWey6AYXpd6IAIOPRt9sPPGfsn52yf/edit?usp=sharing&ouid=101729704118090198595&rtpof=true&sd=true"
          target="_blank"
          rel="noreferrer"
        >
          One Pager
        </a>
        <span> and </span>
        <a
          className="demo-banner-link"
          href="https://docs.google.com/document/d/1K_0pICYr3TGqFD6-bgNNLMVeSsStaHGi/edit?usp=sharing&ouid=101729704118090198595&rtpof=true&sd=true"
          target="_blank"
          rel="noreferrer"
        >
          Full Strategy Doc
        </a>
        <span> for more details</span>
        <span className="demo-banner-sep">·</span>
        <span>Questions? Reach out to <strong>Noah Kalodner</strong></span>
      </div>

      {/* Top Header Bar */}
      <header className="xm-topbar">
        <div className="xm-topbar-left">
          <span className="xm-logo" style={{ cursor: 'pointer' }} onClick={handleGoHome}>XM</span>
          <button className="xm-menu-btn">
            <Menu size={20} />
          </button>
          {view === 'home' ? (
            <span className="xm-topbar-home-label">Home</span>
          ) : (
            <>
              <button className="xm-topbar-breadcrumb-home" onClick={handleGoHome}>
                Home
              </button>
              <span className="xm-topbar-breadcrumb-sep">/</span>
              <button className="xm-project-selector">
                {ACTIVE_PROJECT.name}
                <ChevronDown size={16} />
              </button>
            </>
          )}
        </div>
        <div className="xm-topbar-right">
          <button className="xm-icon-btn">
            <HelpCircle size={20} />
          </button>
          <button className="xm-icon-btn">
            <Bell size={20} />
          </button>
          <div className="xm-avatar">N</div>
          <button className="xm-icon-btn">
            <Grid3X3 size={20} />
          </button>
        </div>
      </header>

      {/* Program Overview (Home) */}
      {view === 'home' && (
        <ProgramOverview
          onSelectProject={handleSelectProject}
          onActionCta={handleActionCta}
        />
      )}

      {/* Project View */}
      {view === 'project' && (
        <>
          {/* Tab Navigation */}
          <nav className="xm-tabs">
            <button className="xm-tab active">Overview</button>
            <button className="xm-tab">Survey</button>
            <button className="xm-tab">Workflows</button>
            <button className="xm-tab">Participants</button>
            <button className="xm-tab">Messages</button>
            <button className="xm-tab">Data & Analysis</button>
          </nav>

          <main className="xm-main">
              <div className="xm-overview-header">
                <h1 className="xm-overview-title">Complete set up of your Employee Engagement project</h1>
                <p className="xm-overview-subtitle">
                  We'll guide you through the setup process and help you prepare your survey and dashboard launch
                </p>
              </div>

              <section className="xm-section">
                <h2 className="xm-section-title">Survey launch</h2>
                <div className="xm-setup-list">
                  <div className="xm-setup-item">
                    <div className="xm-setup-icon completed"><CheckCircle2 size={24} /></div>
                    <div className="xm-setup-content">
                      <div className="xm-setup-title">Review survey questions</div>
                      <div className="xm-setup-description">
                        Create an Engagement survey with research-backed, benchmarked questions
                      </div>
                    </div>
                    <div className="xm-setup-action"><a href="#" className="xm-link">Modify</a></div>
                  </div>

                  <div className="xm-setup-item">
                    <div className="xm-setup-icon completed"><CheckCircle2 size={24} /></div>
                    <div className="xm-setup-content">
                      <div className="xm-setup-title">Add participants and org hierarchy</div>
                      <div className="xm-setup-description">
                        Set up people data to send surveys, break down dashboard results and share information with the appropriate groups
                      </div>
                    </div>
                    <div className="xm-setup-action"><a href="#" className="xm-link">Modify</a></div>
                  </div>

                  <div className="xm-setup-item">
                    <div className="xm-setup-icon completed"><CheckCircle2 size={24} /></div>
                    <div className="xm-setup-content">
                      <div className="xm-setup-title">Distribute survey</div>
                      <div className="xm-setup-description">
                        Choose how to distribute your survey and what messages to send to survey recipients
                      </div>
                    </div>
                    <div className="xm-setup-action"><a href="#" className="xm-link">Modify</a></div>
                  </div>
                </div>
              </section>

              <section className="xm-section">
                <h2 className="xm-section-title">Dashboard launch</h2>
                <div className="xm-setup-list">
                  <div className="xm-setup-item">
                    <div className="xm-setup-icon completed"><CheckCircle2 size={24} /></div>
                    <div className="xm-setup-content">
                      <div className="xm-setup-title">Build a dashboard</div>
                      <div className="xm-setup-description">
                        Create dashboards using KPIs and drivers, set up confidentiality, comparisons, and action planning settings, all while aligning with your desired look and feel
                      </div>
                    </div>
                    <div className="xm-setup-action"><a href="#" className="xm-link">Modify</a></div>
                  </div>

                  <div className="xm-setup-item">
                    <div className="xm-setup-icon completed"><CheckCircle2 size={24} /></div>
                    <div className="xm-setup-content">
                      <div className="xm-setup-title">Distribute dashboard</div>
                      <div className="xm-setup-description">
                        Choose how to distribute your dashboard and what messages to send to dashboard users
                      </div>
                    </div>
                    <div className="xm-setup-action"><a href="#" className="xm-link">Modify</a></div>
                  </div>
                </div>
              </section>
            </main>
        </>
      )}
    </div>
  );
}

export default App;
