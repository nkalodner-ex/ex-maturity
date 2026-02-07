import { Sparkles, ArrowRight, X } from 'lucide-react';
import type { ProjectInsights } from '../types';
import { useState } from 'react';

interface InsightBannerProps {
  insights: ProjectInsights;
  onSetupTextIQ: () => void;
}

export function InsightBanner({ insights, onSetupTextIQ }: InsightBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Count themes with concerning sentiment
  const concerningThemes = insights.themes.filter(
    t => t.negativeCount / t.commentCount > 0.3
  ).length;

  return (
    <div className="q-insight-nudge">
      <div className="q-insight-nudge-icon">
        <Sparkles size={16} />
      </div>
      <div className="q-insight-nudge-content">
        <span className="q-insight-nudge-text">
          <strong>{insights.totalComments.toLocaleString()} open-ended responses</strong> detected
          {concerningThemes > 0 && (
            <> with {concerningThemes} theme{concerningThemes > 1 ? 's' : ''} that may need attention</>
          )}.
        </span>
        <button className="q-insight-nudge-cta" onClick={onSetupTextIQ}>
          Set up Text iQ analysis
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
