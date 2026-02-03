import { Sparkles, ArrowRight, MessageSquareText } from 'lucide-react';
import type { ProjectInsights, ThemeInsight } from '../types';
import { getTopInsights } from '../utils/insightGenerator';

interface InsightBannerProps {
  insights: ProjectInsights;
  onSetupTextIQ: () => void;
  onViewDetails: (theme: ThemeInsight) => void;
}

function getSentimentBadgeClass(label: ThemeInsight['sentimentLabel']): string {
  switch (label) {
    case 'Mostly Negative':
      return 'negative';
    case 'Mostly Positive':
      return 'positive';
    default:
      return 'mixed';
  }
}

function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function InsightBanner({ insights, onSetupTextIQ, onViewDetails }: InsightBannerProps) {
  const topThemes = getTopInsights(insights, 3);

  const themesNeedingAttention = topThemes.filter(
    t => t.sentimentLabel === 'Mostly Negative' || t.negativeCount / t.commentCount > 0.3
  );

  return (
    <div className="q-insight-banner">
      <div className="q-insight-banner-header">
        <div className="q-insight-banner-icon">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="q-insight-banner-title">Text iQ Insights Available</div>
          <div className="q-insight-banner-subtitle">AI-powered analysis of open-ended responses</div>
        </div>
      </div>

      <div className="q-insight-summary">
        <MessageSquareText
          size={16}
          style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }}
        />
        I've analyzed <strong>{insights.totalComments.toLocaleString()} comments</strong> from your survey.
        {themesNeedingAttention.length > 0 ? (
          <>
            {' '}
            <strong>{themesNeedingAttention.length} theme{themesNeedingAttention.length > 1 ? 's' : ''}</strong> need
            attention:
          </>
        ) : (
          <> Here are the top themes discovered:</>
        )}
      </div>

      <div className="q-insight-themes">
        {topThemes.map((theme, index) => {
          const negativePercentage = Math.round((theme.negativeCount / theme.commentCount) * 100);
          const positivePercentage = Math.round((theme.positiveCount / theme.commentCount) * 100);

          return (
            <div
              key={theme.name}
              className="q-insight-theme"
              onClick={() => onViewDetails(theme)}
              style={{ cursor: 'pointer' }}
            >
              <div className="q-insight-theme-header">
                <span className="q-insight-theme-name">
                  {index + 1}. {theme.name}
                </span>
                <span className={`q-insight-theme-badge ${getSentimentBadgeClass(theme.sentimentLabel)}`}>
                  {theme.sentimentLabel === 'Mostly Negative'
                    ? `${negativePercentage}% negative sentiment`
                    : theme.sentimentLabel === 'Mostly Positive'
                    ? `${positivePercentage}% positive sentiment`
                    : 'Mixed sentiment'}
                </span>
              </div>
              <div className="q-insight-theme-stats">
                <span>{theme.commentCount} mentions</span>
                <span>•</span>
                <span>{formatPercentage(theme.percentageOfTotal)} of all comments</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="q-insight-cta">
        <div className="q-insight-cta-text">
          Set up the Text iQ widget for full analysis, including word clouds, topic drilling, and sentiment trends.
        </div>
        <button className="q-btn q-btn-white" onClick={onSetupTextIQ}>
          Set Up Text iQ Widget
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
