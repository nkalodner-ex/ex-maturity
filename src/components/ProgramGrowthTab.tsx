import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Headphones,
  Lightbulb,
  Rocket,
} from 'lucide-react';
import type { GrowthAction, GrowthCategory, Project } from '../types';
import { AnnualTimeline } from './AnnualTimeline';

interface ProgramGrowthTabProps {
  actions: GrowthAction[];
  projects: Project[];
  onActionCta: (actionId: string) => void;
  onSelectProject: (projectId: string) => void;
  clickableProjectId?: string;
}

const CATEGORY_META: Record<GrowthCategory, { label: string; icon: typeof Headphones; color: string; bg: string }> = {
  listen:     { label: 'Listen',     icon: Headphones, color: '#0077CC', bg: '#EBF4FF' },
  understand: { label: 'Understand', icon: Lightbulb,  color: '#6B47DC', bg: '#F3EFFC' },
  act:        { label: 'Act',        icon: Rocket,     color: '#0B8043', bg: '#EAF4EE' },
};

const CATEGORY_ORDER: GrowthCategory[] = ['listen', 'understand', 'act'];
const MAX_PER_COLUMN = 3;

export function ProgramGrowthTab({
  actions,
  projects,
  onActionCta,
  onSelectProject,
  clickableProjectId,
}: ProgramGrowthTabProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [recommendationsOpen, setRecommendationsOpen] = useState(false);

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

      {/* Section 1 — Listening timeline */}
      <section className="pg-timeline-section">
        <AnnualTimeline
          projects={projects}
          onSelectProject={onSelectProject}
          clickableProjectId={clickableProjectId}
        />
      </section>

      {/* Section 2 — Recommended actions, collapsed by default */}
      <section className={`pg-recommendations-section ${recommendationsOpen ? 'open' : 'closed'}`}>
        <button
          type="button"
          className="pg-recommendations-toggle"
          onClick={() => setRecommendationsOpen(o => !o)}
          aria-expanded={recommendationsOpen}
        >
          <span className="pg-recommendations-toggle-chevron">
            {recommendationsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
          <span className="pg-recommendations-toggle-text">
            <span className="prog-section-label">Recommended next steps</span>
            <span className="pg-recommendations-toggle-sub">
              {recommendationsOpen
                ? 'Hide other ways to get more value from your program.'
                : 'Show other ways to get more value from your program.'}
            </span>
          </span>
        </button>

        {recommendationsOpen && (
          <div className="pg-recommendations-body">
            <p className="pg-recommendations-sub">
              Based on how your program is set up today, here are a few ways to get more value from your employee experience data.
            </p>

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
          </div>
        )}
      </section>
    </div>
  );
}
