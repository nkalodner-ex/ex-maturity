import { X, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import type { ThemeInsight } from '../types';

interface ThemeDetailCardProps {
  theme: ThemeInsight;
  onClose: () => void;
}

function getSentimentClass(label: ThemeInsight['sentimentLabel']): string {
  switch (label) {
    case 'Mostly Negative':
      return 'negative';
    case 'Mostly Positive':
      return 'positive';
    default:
      return 'mixed';
  }
}

export function ThemeDetailCard({ theme, onClose }: ThemeDetailCardProps) {
  const positiveWidth = (theme.positiveCount / theme.commentCount) * 100;
  const negativeWidth = (theme.negativeCount / theme.commentCount) * 100;
  const neutralWidth = (theme.neutralCount / theme.commentCount) * 100;

  return (
    <div className={`q-card q-theme-card ${getSentimentClass(theme.sentimentLabel)}`}>
      <div className="q-card-header">
        <div>
          <div className="q-card-title">{theme.name}</div>
          <div className="q-card-subtitle">
            {theme.commentCount} comments • {theme.sentimentLabel}
          </div>
        </div>
        <button className="q-btn q-btn-ghost" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="q-card-body">
        <div className="q-theme-stats">
          <div className="q-stat">
            <div className="q-stat-value positive">{theme.positiveCount}</div>
            <div className="q-stat-label">
              <ThumbsUp size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Positive
            </div>
          </div>
          <div className="q-stat">
            <div className="q-stat-value">{theme.neutralCount}</div>
            <div className="q-stat-label">
              <Minus size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Neutral
            </div>
          </div>
          <div className="q-stat">
            <div className="q-stat-value negative">{theme.negativeCount}</div>
            <div className="q-stat-label">
              <ThumbsDown size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Negative
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#5F6368', marginBottom: '8px' }}>
            Sentiment Distribution
          </div>
          <div className="q-sentiment-bar">
            <div
              className="q-sentiment-bar-segment positive"
              style={{ width: `${positiveWidth}%` }}
            />
            <div
              className="q-sentiment-bar-segment neutral"
              style={{ width: `${neutralWidth}%` }}
            />
            <div
              className="q-sentiment-bar-segment negative"
              style={{ width: `${negativeWidth}%` }}
            />
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: '#80868B',
              marginTop: '4px',
            }}
          >
            <span>{Math.round(positiveWidth)}% positive</span>
            <span>{Math.round(negativeWidth)}% negative</span>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            Sample Comments
          </div>
          <div className="q-comments">
            {theme.topComments.map(comment => (
              <div key={comment.id} className={`q-comment ${comment.sentiment}`}>
                <div className="q-comment-text">"{comment.comment}"</div>
                <div className="q-comment-meta">
                  Sentiment score: {comment.sentimentScore.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
