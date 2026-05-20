import type { Project } from '../types';
import { generateProjectInsights } from '../utils/insightGenerator';

export const mockProjects: Project[] = [
  {
    id: 'employee_engagement',
    name: 'Annual Employee Engagement Survey',
    type: 'employee_engagement',
    programKind: 'engagement',
    status: 'active',
    // 1,847 of 3,184 invited = 58% response rate. Tiers both the home listening
    // nudge and the EX Growth listen-frequency action on `engagePulseResponseRate`:
    //   < 30%  → Improve existing engagement program
    //   < 70%  → Add Pulse to supplement (sampled cadence)
    //   < 85%  → Expand engagement to biannual (+ Pulse complement)
    //   >= 85% → Expand engagement to quarterly (+ Pulse complement)
    // To demo a different tier, change responseCount/invited so the ratio
    // lands in a new band.
    responseCount: 1847,
    invited: 3184,
    hasOpenEndedResponses: true,
    lastUpdated: '2024-02-24',
    insights: generateProjectInsights('employee_engagement', 'Annual Employee Engagement Survey'),
    schedule: { cadence: 'annual', anchorMonth: 11, day: 1 },
  },
  {
    id: 'engagement_2023',
    name: 'Q4 2023 Employee Engagement Survey',
    type: 'employee_engagement',
    programKind: 'engagement',
    status: 'closed',
    responseCount: 1654,
    hasOpenEndedResponses: true,
    lastUpdated: '2023-12-15',
  },
  {
    id: 'monthly_pulse',
    name: 'Monthly Pulse Program',
    type: 'employee_engagement',
    programKind: 'pulse',
    status: 'active',
    responseCount: 142,
    hasOpenEndedResponses: false,
    lastUpdated: '2024-02-15',
    // Sampled monthly cadence: ~5% of the population each month, rotated so
    // every employee is heard over time. Sends on the 15th of each month.
    schedule: { cadence: 'monthly', day: 15 },
  },
  {
    id: 'lifecycle_onboarding',
    name: 'New Hire Onboarding Feedback',
    type: 'lifecycle',
    status: 'active',
    responseCount: 234,
    hasOpenEndedResponses: false,
    lastUpdated: '2024-02-20',
    schedule: { cadence: 'continuous' },
  },
  {
    id: 'lifecycle_exit',
    name: 'Exit Interview Survey',
    type: 'lifecycle',
    status: 'active',
    responseCount: 89,
    hasOpenEndedResponses: false,
    lastUpdated: '2024-02-18',
    schedule: { cadence: 'continuous' },
  },
  {
    id: 'manager_360',
    name: 'Manager Effectiveness 360',
    type: '360',
    status: 'new',
    responseCount: 0,
    hasOpenEndedResponses: false,
    lastUpdated: '2024-02-10',
    schedule: { cadence: 'one-time', anchorMonth: 6, day: 1 },
  },
];
