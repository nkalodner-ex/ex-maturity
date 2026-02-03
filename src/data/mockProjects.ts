import type { Project } from '../types';
import { generateProjectInsights } from '../utils/insightGenerator';

export const mockProjects: Project[] = [
  {
    id: 'employee_engagement',
    name: 'Q4 2024 Employee Engagement Survey',
    type: 'employee_engagement',
    responseCount: 1847,
    hasOpenEndedResponses: true,
    lastUpdated: '2024-02-24',
    insights: generateProjectInsights('employee_engagement', 'Q4 2024 Employee Engagement Survey'),
  },
  {
    id: 'lifecycle_onboarding',
    name: 'New Hire Onboarding Feedback',
    type: 'lifecycle',
    responseCount: 234,
    hasOpenEndedResponses: false,
    lastUpdated: '2024-02-20',
  },
  {
    id: 'lifecycle_exit',
    name: 'Exit Interview Survey',
    type: 'lifecycle',
    responseCount: 89,
    hasOpenEndedResponses: false,
    lastUpdated: '2024-02-18',
  },
];
