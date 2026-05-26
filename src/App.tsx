import { useMemo, useState } from 'react';
import {
  Menu,
  ChevronDown,
  HelpCircle,
  Bell,
  Grid3X3,
  CheckCircle2,
  Home as HomeIcon,
  Sparkles,
  Settings,
  ChevronUp,
  Terminal,
} from 'lucide-react';
import { mockProjects } from './data/mockProjects';
import { generateGrowthActions } from './data/maturityActions';
import { ProgramOverview } from './components/ProgramOverview';
import { ProgramGrowthTab } from './components/ProgramGrowthTab';
import './styles/qualtrics.css';

const ACTIVE_PROJECT = mockProjects.find(p => p.id === 'employee_engagement')!;

type View = 'home' | 'project' | 'growth';

/**
 * Demo presets — each lands in a different response-rate tier so the
 * audience can see how the recommendations shift for customers at
 * different maturity points. Reads from `engagePulseResponseRate` in
 * `maturityActions.ts`; see the tier breakpoints there.
 */
type ProfileKey = 'struggling' | 'building' | 'healthy' | 'exceptional';

interface Profile {
  key: ProfileKey;
  label: string;
  rate: number;          // 0..1; rendered as % and used to override responseCount
  tagline: string;       // short description of where this customer sits
  triggers: string;      // which recommendation lights up
  rrChange: string;      // for the Response Rate metric card on EX Growth
  rrTrend: 'up' | 'down';
  rrSub: string;
}

const PROFILES: readonly Profile[] = [
  {
    key: 'struggling',
    label: 'Struggling',
    rate: 0.22,
    tagline: 'Annual response rate well below benchmark.',
    triggers: 'Triggers: improve existing program (fix before expanding).',
    rrChange: '-15pts',
    rrTrend: 'down',
    rrSub: 'vs. 37% last cycle',
  },
  {
    key: 'building',
    label: 'Building',
    rate: 0.58,
    tagline: 'Healthy but not yet saturated.',
    triggers: 'Triggers: add Pulse to supplement annual engagement.',
    rrChange: '-7pts',
    rrTrend: 'down',
    rrSub: 'vs. 65% last cycle',
  },
  {
    key: 'healthy',
    label: 'Healthy',
    rate: 0.78,
    tagline: 'Strong participation; ready to listen more often.',
    triggers: 'Triggers: expand engagement to biannual + Pulse complement.',
    rrChange: '+5pts',
    rrTrend: 'up',
    rrSub: 'vs. 73% last cycle',
  },
  {
    key: 'exceptional',
    label: 'Exceptional',
    rate: 0.92,
    tagline: 'Exceptional participation; biggest cadence headroom.',
    triggers: 'Triggers: expand engagement to quarterly + Pulse complement.',
    rrChange: '+8pts',
    rrTrend: 'up',
    rrSub: 'vs. 84% last cycle',
  },
];

function App() {
  const [view, setView] = useState<View>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  // Demo controls. Both flow into how `projects` is derived; everything
  // else (deriveAccountState, generateGrowthActions, the timeline, the
  // home nudge, the metric cards) reads from that.
  const [pulseEnabled, setPulseEnabled] = useState(true);
  const [profileKey, setProfileKey] = useState<ProfileKey>('building');
  const [demoOpen, setDemoOpen] = useState(false);

  const profile = PROFILES.find(p => p.key === profileKey)!;

  const projects = useMemo(() => {
    // Override the Annual Engagement project's responseCount to match the
    // selected profile's response rate (invited stays fixed). Filter out the
    // monthly Pulse program when the toggle is OFF.
    const overrideCount = Math.round((ACTIVE_PROJECT.invited ?? 0) * profile.rate);
    return mockProjects
      .map(p =>
        p.id === 'employee_engagement'
          ? { ...p, responseCount: overrideCount }
          : p,
      )
      .filter(p => pulseEnabled || p.id !== 'monthly_pulse');
  }, [pulseEnabled, profile.rate]);

  const handleSelectProject = (projectId: string) => {
    if (projectId === 'employee_engagement') {
      setView('project');
    }
  };

  const handleActionCta = (_actionId: string) => {};

  const handleGoHome = () => {
    setView('home');
  };

  const navigateTo = (next: View) => {
    setView(next);
    setMenuOpen(false);
  };

  const growthActions = useMemo(() => generateGrowthActions(projects), [projects]);

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
        <span className="demo-banner-sep">·</span>
        <button
          type="button"
          className={`demo-banner-settings-btn ${demoOpen ? 'active' : ''}`}
          onClick={() => setDemoOpen(o => !o)}
          aria-expanded={demoOpen}
        >
          <Settings size={13} />
          <span>Demo settings</span>
          <span className="demo-banner-settings-summary">
            {profile.label} · Pulse {pulseEnabled ? 'ON' : 'OFF'}
          </span>
          {demoOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Demo Settings Panel — slides out under the banner when toggled.
          Styled like an admin/dev console to make it visually distinct
          from the rest of the Qualtrics-styled UI. */}
      {demoOpen && (
        <div className="demo-settings-panel">
          <div className="demo-settings-inner">
            <div className="demo-settings-admin-header">
              <span className="demo-settings-admin-badge">
                <Terminal size={12} />
                ADMIN
              </span>
              <span className="demo-settings-admin-title">Demo controls</span>
              <span className="demo-settings-admin-meta">
                Internal-only · Not part of the customer product
              </span>
            </div>
            <section className="demo-settings-section">
              <div className="demo-settings-section-header">
                <h3 className="demo-settings-section-title">Customer profile</h3>
                <p className="demo-settings-section-sub">
                  Each preset overrides the Annual Engagement response rate, which is what the
                  recommendation engine tiers on. Both the home nudge and the EX Growth tab
                  update live.
                </p>
              </div>
              <div className="demo-settings-profiles">
                {PROFILES.map(p => {
                  const active = p.key === profileKey;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      className={`demo-settings-profile ${active ? 'active' : ''}`}
                      onClick={() => setProfileKey(p.key)}
                      aria-pressed={active}
                    >
                      <div className="demo-settings-profile-top">
                        <span className="demo-settings-profile-label">{p.label}</span>
                        <span className="demo-settings-profile-rate">
                          {Math.round(p.rate * 100)}%
                        </span>
                      </div>
                      <div className="demo-settings-profile-tagline">{p.tagline}</div>
                      <div className="demo-settings-profile-triggers">{p.triggers}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="demo-settings-section demo-settings-section-row">
              <div className="demo-settings-section-header">
                <h3 className="demo-settings-section-title">Monthly Pulse program</h3>
                <p className="demo-settings-section-sub">
                  When ON, the timeline shows engagement + Pulse together and the engine treats
                  Pulse recommendations as already satisfied. When OFF, Pulse falls off the
                  timeline and the Pulse-supplement / Pulse-complement recommendations fire.
                </p>
              </div>
              <label className="demo-settings-toggle">
                <button
                  type="button"
                  className={`demo-banner-switch ${pulseEnabled ? 'on' : 'off'}`}
                  role="switch"
                  aria-checked={pulseEnabled}
                  onClick={() => setPulseEnabled(v => !v)}
                >
                  <span className="demo-banner-switch-knob" />
                </button>
                <span className={`demo-banner-toggle-state ${pulseEnabled ? 'on' : 'off'}`}>
                  {pulseEnabled ? 'ON' : 'OFF'}
                </span>
              </label>
            </section>
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="xm-topbar">
        <div className="xm-topbar-left">
          <span className="xm-logo" style={{ cursor: 'pointer' }} onClick={handleGoHome}>XM</span>
          <div className="xm-menu-wrap">
            <button
              className="xm-menu-btn"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
            >
              <Menu size={20} />
            </button>
            {menuOpen && (
              <>
                <div className="xm-menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="xm-nav-menu" role="menu">
                  <button
                    className={`xm-nav-menu-item ${view === 'home' ? 'active' : ''}`}
                    onClick={() => navigateTo('home')}
                    role="menuitem"
                  >
                    <HomeIcon size={16} />
                    <span>Home</span>
                  </button>
                  <button
                    className={`xm-nav-menu-item ${view === 'growth' ? 'active' : ''}`}
                    onClick={() => navigateTo('growth')}
                    role="menuitem"
                  >
                    <Sparkles size={16} />
                    <span>EX Growth</span>
                  </button>
                </div>
              </>
            )}
          </div>
          {view === 'home' && (
            <span className="xm-topbar-home-label">Home</span>
          )}
          {view === 'growth' && (
            <span className="xm-topbar-home-label">EX Growth</span>
          )}
          {view === 'project' && (
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
          projects={projects}
          onSelectProject={handleSelectProject}
          onActionCta={handleActionCta}
          onNavigateToGrowth={() => navigateTo('growth')}
          responseRate={{
            value: `${Math.round(profile.rate * 100)}%`,
            change: profile.rrChange,
            trend: profile.rrTrend,
            sub: profile.rrSub,
          }}
        />
      )}

      {/* EX Growth tab — listening timeline + the full Listen / Understand /
          Act framework (collapsed by default). The overview metrics moved
          to the home page. */}
      {view === 'growth' && (
        <main className="xm-growth-page">
          <ProgramGrowthTab
            actions={growthActions}
            projects={projects}
            onActionCta={handleActionCta}
            onSelectProject={handleSelectProject}
            clickableProjectId="employee_engagement"
          />
        </main>
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
