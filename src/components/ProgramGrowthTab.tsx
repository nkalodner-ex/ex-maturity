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

const CATEGORY_META: Record<GrowthCategory, { label: string; icon: typeof Headphones; color: string }> = {
  listen: { label: 'Listen', icon: Headphones, color: '#0077CC' },
  understand: { label: 'Understand', icon: Lightbulb, color: '#6B47DC' },
  act: { label: 'Act', icon: Rocket, color: '#0B8043' },
};

const CATEGORY_ORDER: GrowthCategory[] = ['listen', 'understand', 'act'];
const DEFAULT_VISIBLE = 5;

export function ProgramGrowthTab({ actions, onActionCta }: ProgramGrowthTabProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const toggleAction = (id: string) => {
    setExpandedAction(prev => (prev === id ? null : id));
  };

  const visibleActions = showAll ? actions : actions.slice(0, DEFAULT_VISIBLE);
  const hiddenCount = actions.length - DEFAULT_VISIBLE;

  const grouped = CATEGORY_ORDER
    .map(cat => ({
      category: cat,
      meta: CATEGORY_META[cat],
      items: visibleActions.filter(a => a.category === cat),
    }))
    .filter(g => g.items.length > 0);

  return (
    <main className="xm-main program-growth">
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

      {/* Grouped recommendations */}
      {grouped.map(({ category, meta, items }) => {
        const Icon = meta.icon;
        return (
          <section key={category} className="pg-category-section">
            <div className="pg-category-header" style={{ borderBottomColor: meta.color }}>
              <Icon size={18} style={{ color: meta.color }} />
              <h2 className="pg-category-title">{meta.label}</h2>
            </div>

            <div className="pg-action-list">
              {items.map(action => {
                const isExpanded = expandedAction === action.id;
                const hasOptions = action.options && action.options.length > 0;

                return (
                  <div key={action.id} className={`pg-action-card ${isExpanded ? 'expanded' : ''}`}>
                    <button className="pg-action-header" onClick={() => toggleAction(action.id)}>
                      <span className="pg-action-chevron">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <span className="pg-action-title">{action.title}</span>
                    </button>

                    {isExpanded && (
                      <div className="pg-action-body">
                        <p className="pg-action-description">{action.description}</p>

                        {/* Multi-path: show option cards */}
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
                                  <ArrowRight size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Single-path: show one CTA */}
                        {!hasOptions && action.ctaLabel && (
                          <button
                            className="pg-action-cta"
                            style={{ background: meta.color }}
                            onClick={() => onActionCta(action.id)}
                          >
                            {action.ctaLabel}
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Show more / less */}
      {hiddenCount > 0 && (
        <div className="pg-show-more">
          <button className="pg-show-more-btn" onClick={() => setShowAll(prev => !prev)}>
            {showAll ? 'Show fewer recommendations' : `Show ${hiddenCount} more recommendation${hiddenCount === 1 ? '' : 's'}`}
            <ChevronDown size={16} className={showAll ? 'pg-chevron-flip' : ''} />
          </button>
        </div>
      )}
    </main>
  );
}
