import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Headphones,
  Lightbulb,
  Rocket,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import type { GrowthAction, GrowthCategory, Project } from '../types';
import { AnnualTimeline } from './AnnualTimeline';

interface ResponseRateMetric {
  value: string;
  change: string;
  trend: 'up' | 'down';
  sub: string;
}

interface ProgramGrowthTabProps {
  actions: GrowthAction[];
  projects: Project[];
  onActionCta: (actionId: string) => void;
  onSelectProject: (projectId: string) => void;
  clickableProjectId?: string;
  /** Profile-driven response-rate metric for the Program at a Glance section. */
  responseRate?: ResponseRateMetric;
}

const CATEGORY_META: Record<GrowthCategory, { label: string; icon: typeof Headphones; color: string; bg: string }> = {
  listen:     { label: 'Listen',     icon: Headphones, color: '#0077CC', bg: '#EBF4FF' },
  understand: { label: 'Understand', icon: Lightbulb,  color: '#6B47DC', bg: '#F3EFFC' },
  act:        { label: 'Act',        icon: Rocket,     color: '#0B8043', bg: '#EAF4EE' },
};

const CATEGORY_ORDER: GrowthCategory[] = ['listen', 'understand', 'act'];
const MAX_PER_COLUMN = 3;

// Top-of-tab overview metrics. Response Rate is profile-driven (see the demo
// settings panel in App.tsx); the other three are hardcoded display text.
// If you change responseCount/invited in mockProjects directly without going
// through the demo profile, update the Response Rate fallback here too so
// the demo stays coherent.
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

export function ProgramGrowthTab({
  actions,
  projects,
  onActionCta,
  onSelectProject,
  clickableProjectId,
  responseRate,
}: ProgramGrowthTabProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  // Stitch the metric cards: keep the static three, insert the dynamic
  // Response Rate into its original third position.
  const rrCard = { label: 'Response Rate', ...(responseRate ?? DEFAULT_RESPONSE_RATE) };
  const keyMetrics = [STATIC_METRICS[0], STATIC_METRICS[1], rrCard, STATIC_METRICS[2]];

  const toggleAction = (id: string) => {
    setExpandedAction(prev => (prev === id ? null : id));
  };

  const columns = CATEGORY_ORDER.map(cat => ({
    category: cat,
    meta: CATEGORY_META[cat],
    items: actions.filter(a => a.category === cat).slice(0, MAX_PER_COLUMN),
  }));

  return (
    <div className="pg-wrapper">
      {/* Header */}
      <div className="pg-header">
        <div className="pg-title-row">
          <h1 className="pg-title">EX Growth</h1>
          <div className="xm-advisor-badge">
            <Sparkles size={14} />
            <span>XM Advisor</span>
          </div>
        </div>
        <p className="pg-subtitle">
          A complete view of your listening program today, and the next steps that get more value out of it.
        </p>
      </div>

      {/* Section 1 — Program at a Glance (overview metrics) */}
      <section className="pg-metrics-section">
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

      {/* Section 2 — Listening timeline */}
      <section className="pg-timeline-section">
        <AnnualTimeline
          projects={projects}
          onSelectProject={onSelectProject}
          clickableProjectId={clickableProjectId}
        />
      </section>

      {/* Section 3 — Recommended actions */}
      <section className="pg-recommendations-section">
        <div className="pg-recommendations-header">
          <h2 className="prog-section-label">Recommended next steps</h2>
          <p className="pg-recommendations-sub">
            Based on how your program is set up today, here are a few ways to get more value from your employee experience data.
          </p>
        </div>

      {/* Three-column grid */}
      <div className="pg-columns">
        {columns.map(({ category, meta, items }) => {
          const Icon = meta.icon;
          return (
            <div key={category} className="pg-column">
              {/* Column header */}
              <div className="pg-col-header" style={{ background: meta.bg, borderTopColor: meta.color }}>
                <Icon size={16} style={{ color: meta.color }} />
                <h2 className="pg-col-title" style={{ color: meta.color }}>{meta.label}</h2>
              </div>

              {/* Action cards */}
              <div className="pg-col-body">
                {items.map(action => {
                  const isExpanded = expandedAction === action.id;
                  const hasOptions = action.options && action.options.length > 0;

                  return (
                    <div key={action.id} className={`pg-action-card ${isExpanded ? 'expanded' : ''}`}>
                      <button
                        className="pg-action-header"
                        onClick={() => toggleAction(action.id)}
                        style={isExpanded ? { borderLeftColor: meta.color } : undefined}
                      >
                        <span className="pg-action-chevron">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </span>
                        <span className="pg-action-title">{action.title}</span>
                      </button>

                      {isExpanded && (
                        <div className="pg-action-body">
                          <p className="pg-action-description">{action.description}</p>

                          {hasOptions && (
                            <div className="pg-options">
                              {action.options!.map(option => (
                                <div key={option.id} className="pg-option-card">
                                  <div className="pg-option-content">
                                    <h4 className="pg-option-label">{option.label}</h4>
                                    <p className="pg-option-desc">{option.description}</p>
                                  </div>
                                  <button
                                    className="pg-option-cta"
                                    style={{ color: meta.color, borderColor: meta.color }}
                                    onClick={() => onActionCta(option.id)}
                                  >
                                    {option.ctaLabel}
                                    <ArrowRight size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {!hasOptions && action.ctaLabel && (
                            <button
                              className="pg-action-cta"
                              style={{ background: meta.color }}
                              onClick={() => onActionCta(action.id)}
                            >
                              {action.ctaLabel}
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </section>
    </div>
  );
}
