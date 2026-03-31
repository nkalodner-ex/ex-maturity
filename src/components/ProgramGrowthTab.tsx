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
import type { GrowthAction, GrowthCategory } from '../types';

interface ProgramGrowthTabProps {
  actions: GrowthAction[];
  onActionCta: (actionId: string) => void;
}

const CATEGORY_META: Record<GrowthCategory, { label: string; icon: typeof Headphones; color: string; bg: string }> = {
  listen:     { label: 'Listen',     icon: Headphones, color: '#0077CC', bg: '#EBF4FF' },
  understand: { label: 'Understand', icon: Lightbulb,  color: '#6B47DC', bg: '#F3EFFC' },
  act:        { label: 'Act',        icon: Rocket,     color: '#0B8043', bg: '#EAF4EE' },
};

const CATEGORY_ORDER: GrowthCategory[] = ['listen', 'understand', 'act'];
const MAX_PER_COLUMN = 3;

export function ProgramGrowthTab({ actions, onActionCta }: ProgramGrowthTabProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);

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
          <h1 className="pg-title">Program Growth</h1>
          <div className="xm-advisor-badge">
            <Sparkles size={14} />
            <span>XM Advisor</span>
          </div>
        </div>
        <p className="pg-subtitle">
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
    </div>
  );
}
