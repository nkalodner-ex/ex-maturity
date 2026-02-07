import { Sparkles, ArrowRight, X, TrendingDown, TrendingUp } from 'lucide-react';
import type { ProjectInsights } from '../types';
import { useState } from 'react';

interface InsightBannerProps {
  insights: ProjectInsights;
  onSetupTextIQ: () => void;
}

export function InsightBanner({ insights, onSetupTextIQ }: InsightBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Find declining themes (sentiment getting worse)
  const decliningThemes = insights.themes.filter(t => t.sentimentTrend === 'declining');
  const improvingThemes = insights.themes.filter(t => t.sentimentTrend === 'improving');

  // Get the most significant declining theme
  const topDecliningTheme = decliningThemes.length > 0
    ? decliningThemes.reduce((prev, curr) =>
        Math.abs(curr.sentimentChange) > Math.abs(prev.sentimentChange) ? curr : prev
      )
    : null;

  // Build the message
  const buildMessage = () => {
    if (topDecliningTheme) {
      return (
        <>
          <strong>{insights.totalComments.toLocaleString()} responses</strong> analyzed across {insights.themes.length} EX themes.{' '}
          <strong>{topDecliningTheme.name}</strong> sentiment is down {Math.abs(topDecliningTheme.sentimentChange)}% from last period
          {decliningThemes.length > 1 && <> (+{decliningThemes.length - 1} other declining)</>}.
        </>
      );
    }

    if (improvingThemes.length > 0) {
      const topImproving = improvingThemes[0];
      return (
        <>
          <strong>{insights.totalComments.toLocaleString()} responses</strong> analyzed across {insights.themes.length} EX themes.{' '}
          <strong>{topImproving.name}</strong> sentiment improving (+{topImproving.sentimentChange}%).
        </>
      );
    }

    return (
      <>
        <strong>{insights.totalComments.toLocaleString()} responses</strong> analyzed across {insights.themes.length} EX themes.
        Sentiment stable across all themes.
      </>
    );
  };

  return (
    <div className="q-insight-nudge">
      <div className="q-insight-nudge-icon">
        {topDecliningTheme ? <TrendingDown size={16} /> : improvingThemes.length > 0 ? <TrendingUp size={16} /> : <Sparkles size={16} />}
      </div>
      <div className="q-insight-nudge-content">
        <span className="q-insight-nudge-text">
          {buildMessage()}
        </span>
        <button className="q-insight-nudge-cta" onClick={onSetupTextIQ}>
          Set up Text iQ
          <ArrowRight size={14} />
        </button>
      </div>
      <button
        className="q-insight-nudge-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
