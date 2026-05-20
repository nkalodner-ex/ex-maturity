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

/**
 * When a survey project sends. Used by the EX Growth tab's annual timeline.
 *
 *   annual    — once a year, sends on annualMonth/annualDay (1-indexed month)
 *   biannual  — every 6 months, with months derived from annualMonth (e.g. May & Nov)
 *   quarterly — every 3 months, derived from annualMonth (e.g. Feb/May/Aug/Nov)
 *   monthly   — every month, sends on monthlyDay
 *   continuous — always-on (lifecycle programs auto-triggered from HRIS)
 *   one-time  — single send window starting at startMonth/startDay
 *
 * If a project has no `schedule` it is omitted from the timeline.
 */
export type ProjectCadence =
  | 'annual'
  | 'biannual'
  | 'quarterly'
  | 'monthly'
  | 'continuous'
  | 'one-time';

export interface ProjectSchedule {
  cadence: ProjectCadence;
  /** For annual/biannual/quarterly/one-time: 1-12. The "anchor" month. */
  anchorMonth?: number;
  /** Day of month (1-31). For annual/biannual/quarterly/one-time/monthly. */
  day?: number;
}

export interface Project {
  id: string;
  name: string;
  type: 'employee_engagement' | 'lifecycle' | 'customer_experience' | '360';
  /** Sub-type within employee_engagement. Helps the timeline label Engagement vs Pulse. */
  programKind?: 'engagement' | 'pulse';
  status: 'active' | 'new' | 'closed';
  responseCount: number;
  /** Total invited population. Used to derive response rate for the home listening nudge. */
  invited?: number;
  hasOpenEndedResponses: boolean;
  lastUpdated: string;
  insights?: ProjectInsights;
  /** Cadence + dates. Drives the EX Growth tab's annual timeline. */
  schedule?: ProjectSchedule;
}

export type GrowthCategory = 'listen' | 'understand' | 'act';

export interface GrowthOption {
  id: string;
  label: string;
  description: string;
  ctaLabel: string;
}

export interface GrowthAction {
  id: string;
  title: string;        // outcome-oriented headline
  description: string;  // why this matters for the customer
  category: GrowthCategory;
  // Single-path actions use ctaLabel directly; multi-path actions use options
  ctaLabel?: string;
  options?: GrowthOption[];
}
