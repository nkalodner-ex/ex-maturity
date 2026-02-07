import type { Comment, ThemeInsight, ProjectInsights } from '../types';
import mockCommentsCSV from '../data/mock_comments.csv?raw';

export function parseCSV(csv: string): Comment[] {
  const lines = csv.trim().split('\n');
  // Skip header line (line 0)

  return lines.slice(1).map(line => {
    // Handle CSV parsing properly (basic implementation)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);

    return {
      id: parseInt(values[0]),
      project: values[1],
      comment: values[2],
      theme: values[3],
      sentiment: values[4] as 'positive' | 'negative' | 'neutral',
      sentimentScore: parseFloat(values[5]),
      date: values[6],
    };
  });
}

export function getSentimentLabel(avgSentiment: number, positiveRatio: number, negativeRatio: number): ThemeInsight['sentimentLabel'] {
  if (positiveRatio > 0.6) return 'Mostly Positive';
  if (negativeRatio > 0.6) return 'Mostly Negative';
  if (Math.abs(avgSentiment) < 0.2) return 'Neutral';
  return 'Mixed';
}

// Simulated sentiment changes from previous period (would come from real comparison in production)
const SIMULATED_TRENDS: Record<string, { trend: 'improving' | 'declining' | 'stable'; change: number }> = {
  'Manager Effectiveness': { trend: 'stable', change: 2 },
  'Growth & Development': { trend: 'declining', change: -8 },
  'Work-Life Balance': { trend: 'declining', change: -12 },
  'Recognition & Respect': { trend: 'improving', change: 5 },
  'Collaboration': { trend: 'stable', change: 1 },
};

export function generateThemeInsights(comments: Comment[]): ThemeInsight[] {
  const themeMap = new Map<string, Comment[]>();

  // Group comments by theme
  comments.forEach(comment => {
    const existing = themeMap.get(comment.theme) || [];
    existing.push(comment);
    themeMap.set(comment.theme, existing);
  });

  const totalComments = comments.length;

  // Generate insights for each theme
  const insights: ThemeInsight[] = Array.from(themeMap.entries()).map(([theme, themeComments]) => {
    const positiveCount = themeComments.filter(c => c.sentiment === 'positive').length;
    const negativeCount = themeComments.filter(c => c.sentiment === 'negative').length;
    const neutralCount = themeComments.filter(c => c.sentiment === 'neutral').length;

    const avgSentiment = themeComments.reduce((sum, c) => sum + c.sentimentScore, 0) / themeComments.length;

    const positiveRatio = positiveCount / themeComments.length;
    const negativeRatio = negativeCount / themeComments.length;

    // Get top comments (most extreme sentiments)
    const sortedComments = [...themeComments].sort((a, b) =>
      Math.abs(b.sentimentScore) - Math.abs(a.sentimentScore)
    );

    // Get simulated trend data
    const trendData = SIMULATED_TRENDS[theme] || { trend: 'stable' as const, change: 0 };

    return {
      name: theme,
      commentCount: themeComments.length,
      positiveCount,
      negativeCount,
      neutralCount,
      averageSentiment: avgSentiment,
      sentimentLabel: getSentimentLabel(avgSentiment, positiveRatio, negativeRatio),
      sentimentTrend: trendData.trend,
      sentimentChange: trendData.change,
      topComments: sortedComments.slice(0, 3),
      percentageOfTotal: (themeComments.length / totalComments) * 100,
    };
  });

  // Sort by comment count (most discussed themes first)
  return insights.sort((a, b) => b.commentCount - a.commentCount);
}

export function generateProjectInsights(projectId: string, projectName: string): ProjectInsights {
  const allComments = parseCSV(mockCommentsCSV);
  const projectComments = allComments.filter(c => c.project === projectId);

  if (projectComments.length === 0) {
    return {
      projectId,
      projectName,
      totalComments: 0,
      hasOpenEndedResponses: false,
      themes: [],
      overallSentiment: 0,
      analyzedAt: new Date().toISOString(),
    };
  }

  const themes = generateThemeInsights(projectComments);
  const overallSentiment = projectComments.reduce((sum, c) => sum + c.sentimentScore, 0) / projectComments.length;

  return {
    projectId,
    projectName,
    totalComments: projectComments.length,
    hasOpenEndedResponses: true,
    themes,
    overallSentiment,
    analyzedAt: new Date().toISOString(),
  };
}

// Get the top N themes that need attention (based on negative sentiment or high volume)
export function getTopInsights(insights: ProjectInsights, count: number = 3): ThemeInsight[] {
  // Prioritize themes with negative sentiment, then by volume
  return [...insights.themes]
    .sort((a, b) => {
      // First, prioritize negative sentiment themes
      if (a.sentimentLabel === 'Mostly Negative' && b.sentimentLabel !== 'Mostly Negative') return -1;
      if (b.sentimentLabel === 'Mostly Negative' && a.sentimentLabel !== 'Mostly Negative') return 1;

      // Then sort by negative ratio
      const aRatio = a.negativeCount / a.commentCount;
      const bRatio = b.negativeCount / b.commentCount;

      if (Math.abs(aRatio - bRatio) > 0.1) {
        return bRatio - aRatio;
      }

      // Finally by volume
      return b.commentCount - a.commentCount;
    })
    .slice(0, count);
}
