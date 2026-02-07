export interface Comment {
  id: number;
  project: string;
  comment: string;
  theme: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  date: string;
}

export interface ThemeInsight {
  name: string;
  commentCount: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  averageSentiment: number;
  sentimentLabel: 'Mostly Positive' | 'Mostly Negative' | 'Mixed' | 'Neutral';
  sentimentTrend: 'improving' | 'declining' | 'stable';
  sentimentChange: number; // percentage change from previous period
  topComments: Comment[];
  percentageOfTotal: number;
}

export interface ProjectInsights {
  projectId: string;
  projectName: string;
  totalComments: number;
  hasOpenEndedResponses: boolean;
  themes: ThemeInsight[];
  overallSentiment: number;
  analyzedAt: string;
}

export interface Project {
  id: string;
  name: string;
  type: 'employee_engagement' | 'lifecycle' | 'customer_experience';
  responseCount: number;
  hasOpenEndedResponses: boolean;
  lastUpdated: string;
  insights?: ProjectInsights;
}
