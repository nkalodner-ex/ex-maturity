import { useState } from 'react';
import { ChevronRight, BarChart2, Users, TrendingUp } from 'lucide-react';
import type { Project } from '../types';
import { InsightBanner } from './InsightBanner';

interface DashboardProps {
  project: Project;
  onBack: () => void;
}

export function Dashboard({ project, onBack }: DashboardProps) {
  const [showTextIQSetup, setShowTextIQSetup] = useState(false);

  const handleSetupTextIQ = () => {
    setShowTextIQSetup(true);
  };

  return (
    <div>
      <div className="q-breadcrumb">
        <a href="#" className="q-breadcrumb-link" onClick={(e) => { e.preventDefault(); onBack(); }}>
          Projects
        </a>
        <ChevronRight size={14} className="q-breadcrumb-separator" />
        <span>{project.name}</span>
      </div>

      <h1 className="q-page-title">{project.name}</h1>

      {/* Text iQ Insight Nudge - Only shows for projects with open-ended responses */}
      {project.hasOpenEndedResponses && project.insights && (
        <div style={{ marginBottom: '24px' }}>
          <InsightBanner
            insights={project.insights}
            onSetupTextIQ={handleSetupTextIQ}
          />
        </div>
      )}

      {/* Text iQ Setup Modal */}
      {showTextIQSetup && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setShowTextIQSetup(false)}
        >
          <div
            className="q-card"
            style={{ maxWidth: '500px', width: '90%' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="q-card-header">
              <div className="q-card-title">Set Up Text iQ Analysis</div>
            </div>
            <div className="q-card-body">
              <p style={{ marginBottom: '16px', color: '#5F6368' }}>
                Text iQ uses AI to automatically categorize and analyze your open-ended responses. Get started in a few steps:
              </p>
              <ul style={{ marginBottom: '24px', paddingLeft: '20px', color: '#3C4043' }}>
                <li style={{ marginBottom: '8px' }}>Automatically discover themes and topics</li>
                <li style={{ marginBottom: '8px' }}>Analyze sentiment across responses</li>
                <li style={{ marginBottom: '8px' }}>Visualize trends with interactive charts</li>
              </ul>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button className="q-btn q-btn-secondary" onClick={() => setShowTextIQSetup(false)}>
                  Maybe Later
                </button>
                <button className="q-btn q-btn-primary">
                  Start Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Widgets Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Response Summary Widget */}
        <div className="q-card">
          <div className="q-card-header">
            <div className="q-card-title">
              <Users size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Response Summary
            </div>
          </div>
          <div className="q-card-body">
            <div className="q-theme-stats">
              <div className="q-stat">
                <div className="q-stat-value">{project.responseCount.toLocaleString()}</div>
                <div className="q-stat-label">Total Responses</div>
              </div>
              <div className="q-stat">
                <div className="q-stat-value">78%</div>
                <div className="q-stat-label">Completion Rate</div>
              </div>
              <div className="q-stat">
                <div className="q-stat-value">4.2</div>
                <div className="q-stat-label">Avg. Duration (min)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Score Widget */}
        <div className="q-card">
          <div className="q-card-header">
            <div className="q-card-title">
              <TrendingUp size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Engagement Score
            </div>
          </div>
          <div className="q-card-body">
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '48px', fontWeight: '700', color: '#0B8043' }}>72</div>
              <div style={{ fontSize: '14px', color: '#5F6368', marginTop: '8px' }}>
                +3 pts from last survey
              </div>
              <div
                style={{
                  display: 'inline-block',
                  marginTop: '12px',
                  padding: '4px 12px',
                  background: '#E6F4EA',
                  borderRadius: '4px',
                  color: '#0B8043',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                Above Benchmark
              </div>
            </div>
          </div>
        </div>

        {/* Top Drivers Widget */}
        <div className="q-card">
          <div className="q-card-header">
            <div className="q-card-title">
              <BarChart2 size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Key Drivers
            </div>
          </div>
          <div className="q-card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Manager Support', score: 82, change: '+5' },
                { name: 'Career Development', score: 68, change: '-2' },
                { name: 'Work Environment', score: 75, change: '+1' },
                { name: 'Recognition', score: 71, change: '+4' },
              ].map(driver => (
                <div key={driver.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, fontSize: '14px' }}>{driver.name}</div>
                  <div style={{ width: '100px', height: '8px', background: '#E8EAED', borderRadius: '4px' }}>
                    <div
                      style={{
                        width: `${driver.score}%`,
                        height: '100%',
                        background: driver.score >= 75 ? '#0B8043' : driver.score >= 60 ? '#F9AB00' : '#D93025',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ width: '30px', fontSize: '14px', fontWeight: '600' }}>{driver.score}</div>
                  <div
                    style={{
                      width: '30px',
                      fontSize: '12px',
                      color: driver.change.startsWith('+') ? '#0B8043' : '#D93025',
                    }}
                  >
                    {driver.change}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
