import { useState } from 'react';
import {
  Menu,
  ChevronDown,
  HelpCircle,
  Bell,
  Grid3X3,
  CheckCircle2,
  Plus,
  LayoutDashboard,
  ChevronLeft,
} from 'lucide-react';
import { mockProjects } from './data/mockProjects';
import { mockHeatmapData, mockHeatmapData2 } from './data/mockHeatmapData';
import { HeatmapWidget } from './components/HeatmapWidget';
import { AddWidgetModal } from './components/AddWidgetModal';
import { ProgramOverview } from './components/ProgramOverview';
import './styles/qualtrics.css';

const mockDashboards = [
  { id: 'q4-2024', name: 'Q4 2024 Engagement Dashboard', lastModified: 'Dec 15, 2024', widgets: 4 },
];

const ACTIVE_PROJECT = mockProjects.find(p => p.id === 'employee_engagement')!;

function App() {
  const [view, setView] = useState<'home' | 'project'>('home');
  const [showTextIQSetup, setShowTextIQSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboards'>('overview');
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);

  const handleSelectProject = (projectId: string) => {
    if (projectId === 'employee_engagement') {
      setActiveTab('overview');
      setSelectedDashboard(null);
      setView('project');
    }
  };

  const handleActionCta = (actionId: string) => {
    if (actionId === 'setup-textiq') {
      setShowTextIQSetup(true);
    }
  };

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
            <button
              className={`xm-tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button className="xm-tab">Survey</button>
            <button className="xm-tab">Workflows</button>
            <button className="xm-tab">Participants</button>
            <button className="xm-tab">Messages</button>
            <button className="xm-tab">Data & Analysis</button>
            <button
              className={`xm-tab ${activeTab === 'dashboards' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboards')}
            >
              Dashboards
            </button>
          </nav>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
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
          )}

          {/* Dashboards Tab - List */}
          {activeTab === 'dashboards' && !selectedDashboard && (
            <main className="xm-main">
              <div className="dashboard-list-header">
                <h1 className="dashboard-list-title">Dashboards</h1>
                <button className="xm-btn xm-btn-primary">
                  <Plus size={16} />
                  Create Dashboard
                </button>
              </div>
              <div className="dashboard-list">
                {mockDashboards.map((dashboard) => (
                  <button
                    key={dashboard.id}
                    className="dashboard-card"
                    onClick={() => setSelectedDashboard(dashboard.id)}
                  >
                    <div className="dashboard-card-icon">
                      <LayoutDashboard size={24} />
                    </div>
                    <div className="dashboard-card-content">
                      <div className="dashboard-card-name">{dashboard.name}</div>
                      <div className="dashboard-card-meta">
                        {dashboard.widgets} widgets · Last modified {dashboard.lastModified}
                      </div>
                    </div>
                    <ChevronDown size={20} className="dashboard-card-arrow" />
                  </button>
                ))}
              </div>
            </main>
          )}

          {/* Dashboards Tab - Detail */}
          {activeTab === 'dashboards' && selectedDashboard && (
            <main className="xm-dashboard">
              <div className="dashboard-header">
                <div className="dashboard-header-left">
                  <button className="dashboard-back-btn" onClick={() => setSelectedDashboard(null)}>
                    <ChevronLeft size={20} />
                    Back
                  </button>
                  <h1 className="dashboard-title">Q4 2024 Engagement Dashboard</h1>
                </div>
                <div className="dashboard-actions">
                  <button className="xm-btn xm-btn-primary" onClick={() => setShowAddWidget(true)}>
                    <Plus size={16} />
                    Add Widget
                  </button>
                </div>
              </div>
              <div className="dashboard-widgets">
                <HeatmapWidget data={mockHeatmapData} />
                <HeatmapWidget data={mockHeatmapData2} />
              </div>
            </main>
          )}
        </>
      )}

      {/* Text iQ Setup Modal */}
      {showTextIQSetup && (
        <div className="xm-modal-overlay" onClick={() => setShowTextIQSetup(false)}>
          <div className="xm-modal" onClick={e => e.stopPropagation()}>
            <div className="xm-modal-header">
              <h2 className="xm-modal-title">Set Up Text iQ Analysis</h2>
            </div>
            <div className="xm-modal-body">
              <p>
                Text iQ uses AI to automatically categorize and analyze your open-ended responses. Get started in a few steps:
              </p>
              <ul>
                <li>Automatically discover themes and topics from EX25 methodology</li>
                <li>Analyze sentiment across responses and track trends over time</li>
                <li>Visualize insights with interactive charts and word clouds</li>
              </ul>
              <div className="xm-modal-footer">
                <button className="xm-btn xm-btn-secondary" onClick={() => setShowTextIQSetup(false)}>
                  Maybe Later
                </button>
                <button className="xm-btn xm-btn-primary">Start Setup</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Widget Modal */}
      {showAddWidget && (
        <AddWidgetModal
          onClose={() => setShowAddWidget(false)}
          onSetupTextIQ={() => {
            setShowAddWidget(false);
            setShowTextIQSetup(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
