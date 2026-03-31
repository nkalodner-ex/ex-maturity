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
import { generateGrowthActions } from './data/maturityActions';
import { HeatmapWidget } from './components/HeatmapWidget';
import { AddWidgetModal } from './components/AddWidgetModal';
import { ProgramGrowthTab } from './components/ProgramGrowthTab';
import './styles/qualtrics.css';

// Mock dashboards list
const mockDashboards = [
  { id: 'q4-2024', name: 'Q4 2024 Engagement Dashboard', lastModified: 'Dec 15, 2024', widgets: 4 },
];

function App() {
  const [showTextIQSetup, setShowTextIQSetup] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'dashboards' | 'program-growth'>('overview');
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null);

  // Generate growth recommendations based on account data
  const growthActions = generateGrowthActions(mockProjects);

  const handleActionCta = (actionId: string) => {
    if (actionId === 'setup-textiq') {
      setShowTextIQSetup(true);
    }
    // Other action CTAs can be wired up here
  };

  return (
    <div>
      {/* Top Header Bar */}
      <header className="xm-topbar">
        <div className="xm-topbar-left">
          <span className="xm-logo">XM</span>
          <button className="xm-menu-btn">
            <Menu size={20} />
          </button>
          <button className="xm-project-selector">
            Q4 2024 Employee Engagement Survey
            <ChevronDown size={16} />
          </button>
        </div>
        <div className="xm-topbar-right">
          <button className="xm-icon-btn">
            <HelpCircle size={20} />
          </button>
          <button className="xm-icon-btn">
            <Bell size={20} />
          </button>
          <div className="xm-avatar">W</div>
          <button className="xm-icon-btn">
            <Grid3X3 size={20} />
          </button>
        </div>
      </header>

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
        <button
          className={`xm-tab ${activeTab === 'program-growth' ? 'active' : ''}`}
          onClick={() => setActiveTab('program-growth')}
        >
          Program Growth
        </button>
      </nav>

      {/* Main Content - Overview Tab */}
      {activeTab === 'overview' && (
        <main className="xm-main">
          {/* Overview Header */}
          <div className="xm-overview-header">
            <h1 className="xm-overview-title">Complete set up of your Employee Engagement project</h1>
            <p className="xm-overview-subtitle">
              We'll guide you through the setup process and help you prepare your survey and dashboard launch
            </p>
          </div>

          {/* Survey Launch Section */}
          <section className="xm-section">
            <h2 className="xm-section-title">Survey launch</h2>
            <div className="xm-setup-list">
              <div className="xm-setup-item">
                <div className="xm-setup-icon completed">
                  <CheckCircle2 size={24} />
                </div>
                <div className="xm-setup-content">
                  <div className="xm-setup-title">Review survey questions</div>
                  <div className="xm-setup-description">
                    Create an Engagement survey with research-backed, benchmarked questions
                  </div>
                </div>
                <div className="xm-setup-action">
                  <a href="#" className="xm-link">Modify</a>
                </div>
              </div>

              <div className="xm-setup-item">
                <div className="xm-setup-icon completed">
                  <CheckCircle2 size={24} />
                </div>
                <div className="xm-setup-content">
                  <div className="xm-setup-title">Add participants and org hierarchy</div>
                  <div className="xm-setup-description">
                    Set up people data to send surveys, break down dashboard results and share information with the appropriate groups
                  </div>
                </div>
                <div className="xm-setup-action">
                  <a href="#" className="xm-link">Modify</a>
                </div>
              </div>

              <div className="xm-setup-item">
                <div className="xm-setup-icon completed">
                  <CheckCircle2 size={24} />
                </div>
                <div className="xm-setup-content">
                  <div className="xm-setup-title">Distribute survey</div>
                  <div className="xm-setup-description">
                    Choose how to distribute your survey and what messages to send to survey recipients
                  </div>
                </div>
                <div className="xm-setup-action">
                  <a href="#" className="xm-link">Modify</a>
                </div>
              </div>
            </div>
          </section>

          {/* Dashboard Launch Section */}
          <section className="xm-section">
            <h2 className="xm-section-title">Dashboard launch</h2>
            <div className="xm-setup-list">
              <div className="xm-setup-item">
                <div className="xm-setup-icon completed">
                  <CheckCircle2 size={24} />
                </div>
                <div className="xm-setup-content">
                  <div className="xm-setup-title">Build a dashboard</div>
                  <div className="xm-setup-description">
                    Create dashboards using KPIs and drivers, set up confidentiality, comparisons, and action planning settings, all while aligning with your desired look and feel
                  </div>
                </div>
                <div className="xm-setup-action">
                  <a href="#" className="xm-link">Modify</a>
                </div>
              </div>

              <div className="xm-setup-item">
                <div className="xm-setup-icon completed">
                  <CheckCircle2 size={24} />
                </div>
                <div className="xm-setup-content">
                  <div className="xm-setup-title">Distribute dashboard</div>
                  <div className="xm-setup-description">
                    Choose how to distribute your dashboard and what messages to send to dashboard users
                  </div>
                </div>
                <div className="xm-setup-action">
                  <a href="#" className="xm-link">Modify</a>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Main Content - Dashboards Tab (List View) */}
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

      {/* Main Content - Dashboards Tab (Detail View) */}
      {activeTab === 'dashboards' && selectedDashboard && (
        <main className="xm-dashboard">
          <div className="dashboard-header">
            <div className="dashboard-header-left">
              <button
                className="dashboard-back-btn"
                onClick={() => setSelectedDashboard(null)}
              >
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

      {/* Main Content - Program Growth Tab */}
      {activeTab === 'program-growth' && (
        <ProgramGrowthTab actions={growthActions} onActionCta={handleActionCta} />
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
                <button className="xm-btn xm-btn-primary">
                  Start Setup
                </button>
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
