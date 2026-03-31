import type { Project, GrowthAction } from '../types';

/**
 * Internally evaluates the customer's maturity level based on the EX maturity
 * framework, then surfaces friendly growth recommendations for the gaps
 * between their current state and the next level(s). The customer never sees
 * levels or scores — just helpful suggestions.
 *
 * Maturity framework (internal):
 *   L1  Basic EX program (listen, understand, act basics)
 *   L2  Continuous listening via multiple touchpoints
 *   L3  Combining touchpoints / meaningful insights
 *   L4  State-of-the-art EX program
 */

// ---------------------------------------------------------------------------
// Simulated account state — in production these would come from real telemetry
// ---------------------------------------------------------------------------
interface AccountState {
  // Listen signals
  hasEngagePulse: boolean;
  engagePulseResponses: number;
  engagePulseFrequencyDays: number; // how recently responses came in
  hasLifecycle: boolean;
  lifecycleResponses: number;
  has360: boolean;
  responses360: number;
  hasResponseClarity: boolean;
  hasAdaptiveFollowUp: boolean;
  // Understand signals
  dashboardViews: number;
  hasManagerAssistDashboard: boolean;
  hasTextIQ: boolean;
  hasBenchmarkWidgets: boolean;
  exWidgetViews: number;
  hasStatsIQ: boolean;
  hasCommentSummaries: boolean;
  commentSummaryViews: number;
  hasQualtricsAssist: boolean;
  qualtricsAssistQuestions: number;
  hasInsightsExplorer: boolean;
  hasEJADataModel: boolean;
  hasEJADashboard: boolean;
  hasAttritionAnalytics: boolean;
  hasCrossXM: boolean;
  hasAIPoweredTopics: boolean;
  has360Report: boolean;
  // Act signals
  hasWorkflows: boolean;
  actionPlansCreated: number;
  ideaBoardsCreated: number;
  hasPersonalizedActions: boolean;
  hasWorkflowIntegration: boolean;
}

function deriveAccountState(projects: Project[]): AccountState {
  const ee = projects.find(p => p.type === 'employee_engagement');
  const lifecycle = projects.filter(p => p.type === 'lifecycle');
  const hasLifecycleResponses = lifecycle.some(p => p.responseCount > 0);

  // Simulated telemetry for this demo account
  return {
    hasEngagePulse: !!ee && ee.responseCount >= 50,
    engagePulseResponses: ee?.responseCount ?? 0,
    engagePulseFrequencyDays: 365, // annual cadence
    hasLifecycle: hasLifecycleResponses,
    lifecycleResponses: lifecycle.reduce((sum, p) => sum + p.responseCount, 0),
    has360: false,
    responses360: 0,
    hasResponseClarity: false,
    hasAdaptiveFollowUp: false,

    dashboardViews: 18,
    hasManagerAssistDashboard: false,
    hasTextIQ: false,
    hasBenchmarkWidgets: false,
    exWidgetViews: 18,
    hasStatsIQ: false,
    hasCommentSummaries: false,
    commentSummaryViews: 0,
    hasQualtricsAssist: false,
    qualtricsAssistQuestions: 0,
    hasInsightsExplorer: false,
    hasEJADataModel: false,
    hasEJADashboard: false,
    hasAttritionAnalytics: false,
    hasCrossXM: false,
    hasAIPoweredTopics: false,
    has360Report: false,

    hasWorkflows: false,
    actionPlansCreated: 0,
    ideaBoardsCreated: 0,
    hasPersonalizedActions: false,
    hasWorkflowIntegration: false,
  };
}

// ---------------------------------------------------------------------------
// Recommendation generation — checks gaps and creates friendly suggestions
// ---------------------------------------------------------------------------
export function generateGrowthActions(projects: Project[]): GrowthAction[] {
  const state = deriveAccountState(projects);
  const actions: GrowthAction[] = [];
  const ee = projects.find(p => p.type === 'employee_engagement');

  // ---- LISTEN ----

  // Pulse / more frequent listening (L2 asks for responses in 183 days)
  if (state.hasEngagePulse && state.engagePulseFrequencyDays > 183) {
    actions.push({
      id: 'setup-pulse',
      title: 'Run a pulse survey between annual cycles',
      description: `Your engagement survey collected ${state.engagePulseResponses.toLocaleString()} responses — but that was your only listening moment this year. A short pulse survey can help you check whether things are improving without waiting for the next annual cycle.`,
      category: 'listen',
      ctaLabel: 'Create Pulse Survey',
    });
  }

  // 360 feedback (L1 measure)
  if (!state.has360) {
    actions.push({
      id: 'setup-360',
      title: 'Add 360 feedback to your listening program',
      description: 'Your engagement survey tells you how teams feel, but not how individual leaders are perceived. A 360 program gives managers direct, multi-rater feedback they can act on.',
      category: 'listen',
      ctaLabel: 'Get Started',
    });
  }

  // Lifecycle expansion (if they have some but could grow, or don't have any)
  if (!state.hasLifecycle) {
    actions.push({
      id: 'add-lifecycle',
      title: 'Capture feedback at key employee moments',
      description: 'Engagement surveys show overall health, but onboarding and exit surveys reveal what\'s driving people to stay or leave. Lifecycle surveys fill in the gaps your annual survey misses.',
      category: 'listen',
      ctaLabel: 'Explore Lifecycle Surveys',
    });
  } else if (state.lifecycleResponses < 50) {
    actions.push({
      id: 'grow-lifecycle',
      title: 'Expand your lifecycle survey reach',
      description: `You're collecting lifecycle feedback, but with ${state.lifecycleResponses} responses it's hard to spot patterns. Consider adding more touchpoints — like candidate experience or internal mobility — to build a fuller picture.`,
      category: 'listen',
      ctaLabel: 'Add Touchpoints',
    });
  }

  // Response Clarity (L3)
  if (!state.hasResponseClarity && state.hasEngagePulse) {
    actions.push({
      id: 'enable-response-clarity',
      title: 'Enable Response Clarity for richer answers',
      description: 'Response Clarity helps employees give more thoughtful, actionable open-ended feedback. It subtly guides respondents to provide specifics instead of vague answers.',
      category: 'listen',
      ctaLabel: 'Enable',
    });
  }

  // Adaptive Follow Up (L3)
  if (!state.hasAdaptiveFollowUp && state.hasEngagePulse) {
    actions.push({
      id: 'enable-adaptive-followup',
      title: 'Use conversational follow-ups to go deeper',
      description: 'Adaptive follow-up questions let the survey respond to what employees say in real time — asking clarifying questions that surface root causes you\'d otherwise miss.',
      category: 'listen',
      ctaLabel: 'Learn More',
    });
  }

  // ---- UNDERSTAND ----

  // Text iQ (L2 measure — core gap for this account)
  if (!state.hasTextIQ && ee?.hasOpenEndedResponses) {
    const commentCount = ee.insights?.totalComments ?? 0;
    actions.push({
      id: 'setup-textiq',
      title: 'Analyze open-ended feedback with Text iQ',
      description: commentCount > 0
        ? `You have ${commentCount.toLocaleString()} open-ended responses sitting unanalyzed. Text iQ automatically surfaces the themes and sentiment in those comments — so you can see what employees are actually saying, not just how they scored.`
        : 'Your survey includes open-ended questions, but the responses aren\'t being analyzed yet. Text iQ uses AI to automatically surface themes and sentiment from employee comments.',
      category: 'understand',
      ctaLabel: 'Start Setup',
    });
  }

  // Dashboard views are low (L1 requires 25+)
  if (state.dashboardViews < 25) {
    actions.push({
      id: 'increase-dashboard-usage',
      title: 'Get more eyes on your dashboard',
      description: `Your dashboard has only ${state.dashboardViews} views so far. Sharing results more broadly — especially with managers — builds trust and accountability. Consider sending a dashboard digest or scheduling a results review.`,
      category: 'understand',
      ctaLabel: 'Share Dashboard',
    });
  }

  // Manager Assist dashboard (L2)
  if (!state.hasManagerAssistDashboard && state.dashboardViews > 0) {
    actions.push({
      id: 'setup-manager-dashboards',
      title: 'Give managers access to their team\'s results',
      description: 'Right now only admins can see the data. Manager Assist dashboards let each manager see their own team\'s engagement results with built-in confidentiality — so they can own the outcomes.',
      category: 'understand',
      ctaLabel: 'Set Up Manager Dashboards',
    });
  }

  // Benchmark widgets (L2)
  if (!state.hasBenchmarkWidgets) {
    actions.push({
      id: 'enable-benchmarks',
      title: 'Add industry benchmarks to your dashboard',
      description: 'Your scores are shown without any external context. Adding Qualtrics benchmarks lets leadership see how your engagement compares to similar organizations — and where you\'re ahead or behind.',
      category: 'understand',
      ctaLabel: 'Enable Benchmarks',
    });
  }

  // Stats iQ (L2)
  if (!state.hasStatsIQ) {
    actions.push({
      id: 'try-statsiq',
      title: 'Use Stats iQ to find hidden drivers',
      description: 'Stats iQ runs statistical analyses on your survey data without requiring a data science team. It can reveal which factors are actually driving engagement — not just which scores are low.',
      category: 'understand',
      ctaLabel: 'Try Stats iQ',
    });
  }

  // Comment Summaries (L3)
  if (!state.hasCommentSummaries && state.hasTextIQ) {
    actions.push({
      id: 'enable-comment-summaries',
      title: 'Surface AI-generated comment summaries',
      description: 'Instead of reading hundreds of comments, let AI summarize the key takeaways for each theme. Comment summaries give managers a quick read on what their teams are saying.',
      category: 'understand',
      ctaLabel: 'Enable',
    });
  }

  // Qualtrics Assist (L3)
  if (!state.hasQualtricsAssist) {
    actions.push({
      id: 'try-qualtrics-assist',
      title: 'Ask questions about your data with Qualtrics Assist',
      description: 'Qualtrics Assist lets you ask natural-language questions about your engagement results and get instant answers. No need to build custom reports — just ask.',
      category: 'understand',
      ctaLabel: 'Try It',
    });
  }

  // Insights Explorer (L3)
  if (!state.hasInsightsExplorer) {
    actions.push({
      id: 'explore-insights-explorer',
      title: 'Generate reports with Insights Explorer',
      description: 'Insights Explorer automatically creates narrative reports from your data — ready to share with leadership. It turns numbers into stories that drive decisions.',
      category: 'understand',
      ctaLabel: 'Explore',
    });
  }

  // Employee Journey Analytics (L3)
  if (!state.hasEJADataModel && state.hasLifecycle && state.hasEngagePulse) {
    actions.push({
      id: 'setup-eja',
      title: 'Connect your surveys with Employee Journey Analytics',
      description: 'You have both engagement and lifecycle data — but they\'re siloed. Employee Journey Analytics links them together so you can see the full employee experience from hire to exit.',
      category: 'understand',
      ctaLabel: 'Set Up EJA',
    });
  }

  // Attrition Analytics (L3)
  if (!state.hasAttritionAnalytics && state.hasEngagePulse) {
    actions.push({
      id: 'enable-attrition-analytics',
      title: 'Predict attrition risk with engagement data',
      description: 'Attrition Analytics uses your engagement survey results to identify which teams or segments are at highest risk of turnover — so you can intervene before people leave.',
      category: 'understand',
      ctaLabel: 'Enable',
    });
  }

  // Cross XM (L4)
  if (!state.hasCrossXM && state.hasEngagePulse) {
    actions.push({
      id: 'explore-crossxm',
      title: 'Connect employee and customer experience data',
      description: 'Cross XM links your EX and CX programs to reveal how employee engagement impacts customer outcomes. See the business case for engagement investment.',
      category: 'understand',
      ctaLabel: 'Learn More',
    });
  }

  // AI Powered Topics (L4)
  if (!state.hasAIPoweredTopics && state.hasTextIQ) {
    actions.push({
      id: 'ai-powered-topics',
      title: 'Use AI-powered topics for smarter text analysis',
      description: 'AI-powered topics automatically generates topic models from your open-ended feedback — going beyond basic themes to find the nuanced issues employees care about.',
      category: 'understand',
      ctaLabel: 'Enable',
    });
  }

  // 360 Subject report (L1)
  if (state.has360 && !state.has360Report) {
    actions.push({
      id: 'create-360-report',
      title: 'Create your first 360 subject report',
      description: 'You\'re collecting 360 feedback but haven\'t generated any reports yet. Subject reports compile multi-rater feedback into actionable development insights for each participant.',
      category: 'understand',
      ctaLabel: 'Create Report',
    });
  }

  // ---- ACT ----

  // Workflows (L2)
  if (!state.hasWorkflows) {
    actions.push({
      id: 'setup-workflows',
      title: 'Automate follow-ups with workflows',
      description: 'Set up automated workflows that trigger when certain conditions are met — like notifying HR when a team\'s engagement drops below a threshold, or sending a thank-you when scores are high.',
      category: 'act',
      ctaLabel: 'Create Workflow',
    });
  }

  // Action plans (L2)
  if (state.actionPlansCreated < 5) {
    actions.push({
      id: 'create-action-plans',
      title: 'Create action plans from your results',
      description: state.actionPlansCreated === 0
        ? 'Survey data is only useful if someone acts on it. Action plans give managers a structured way to turn their team\'s feedback into concrete improvement steps with owners and deadlines.'
        : `You have ${state.actionPlansCreated} action plan${state.actionPlansCreated > 1 ? 's' : ''} so far. Getting more managers to create plans ensures feedback leads to real change — not just reports that sit on a shelf.`,
      category: 'act',
      ctaLabel: 'Create Action Plan',
    });
  }

  // Idea boards (L2)
  if (state.ideaBoardsCreated < 5) {
    actions.push({
      id: 'setup-idea-boards',
      title: 'Crowdsource solutions with Idea Boards',
      description: 'Idea Boards let employees propose and vote on improvement ideas. It turns feedback into a two-way conversation — employees feel heard, and managers get practical suggestions.',
      category: 'act',
      ctaLabel: 'Create Idea Board',
    });
  }

  // Personalized Action Recommendations (L3)
  if (!state.hasPersonalizedActions && state.actionPlansCreated > 0) {
    actions.push({
      id: 'personalized-actions',
      title: 'Get AI-recommended actions for each team',
      description: 'Personalized Action Recommendations use your data to suggest specific, evidence-based actions for each manager — so they don\'t have to figure out what to do on their own.',
      category: 'act',
      ctaLabel: 'Enable',
    });
  }

  // Workflow with integration (L3)
  if (!state.hasWorkflowIntegration && state.hasWorkflows) {
    actions.push({
      id: 'workflow-integration',
      title: 'Connect workflows to your existing tools',
      description: 'Your workflows run inside Qualtrics, but your teams work in Slack, Teams, and Jira. Connecting workflows to third-party tools puts insights where people already are.',
      category: 'act',
      ctaLabel: 'Add Integration',
    });
  }

  return actions;
}
