import type { Project, GrowthAction } from '../types';

/**
 * Internally evaluates the customer's maturity level based on the EX maturity
 * framework, then surfaces outcome-focused growth recommendations. Each
 * recommendation explains the business value and, where multiple features
 * could satisfy the goal, lets the customer choose their path.
 *
 * The customer never sees levels or scores.
 */

// ---------------------------------------------------------------------------
// Simulated account state
// ---------------------------------------------------------------------------
export interface AccountState {
  // Listen
  hasEngagePulse: boolean;
  /** True when an active monthly/quarterly Pulse program already exists. */
  hasActivePulse: boolean;
  engagePulseResponses: number;
  engagePulseInvited: number;
  engagePulseResponseRate: number; // 0..1, drives the home listening nudge
  engagePulseFrequencyDays: number;
  hasLifecycle: boolean;
  lifecycleResponses: number;
  has360: boolean;
  hasResponseClarity: boolean;
  hasAdaptiveFollowUp: boolean;
  // Understand
  dashboardViews: number;
  hasManagerAssistDashboard: boolean;
  hasTextIQ: boolean;
  hasBenchmarkWidgets: boolean;
  hasStatsIQ: boolean;
  hasCommentSummaries: boolean;
  hasQualtricsAssist: boolean;
  hasInsightsExplorer: boolean;
  hasEJADataModel: boolean;
  hasEJADashboard: boolean;
  hasAttritionAnalytics: boolean;
  hasCrossXM: boolean;
  hasAIPoweredTopics: boolean;
  // Act
  hasWorkflows: boolean;
  actionPlansCreated: number;
  ideaBoardsCreated: number;
  hasPersonalizedActions: boolean;
  hasWorkflowIntegration: boolean;
}

export function deriveAccountState(projects: Project[]): AccountState {
  // The "primary" engagement program is the active annual engagement survey.
  // We deliberately exclude pulses here — Pulse is now framed as a sampled
  // supplement *to* engagement, not a substitute for it.
  const ee = projects.find(
    p => p.type === 'employee_engagement'
      && p.programKind !== 'pulse'
      && p.status !== 'closed'
  );
  const hasActivePulse = projects.some(
    p => p.type === 'employee_engagement'
      && p.programKind === 'pulse'
      && p.status !== 'closed'
  );
  const lifecycle = projects.filter(p => p.type === 'lifecycle');
  const hasLifecycleResponses = lifecycle.some(p => p.responseCount > 0);

  const engagePulseInvited = ee?.invited ?? Math.max(ee?.responseCount ?? 0, 1);
  const engagePulseResponses = ee?.responseCount ?? 0;
  const engagePulseResponseRate = engagePulseInvited > 0
    ? engagePulseResponses / engagePulseInvited
    : 0;

  return {
    hasEngagePulse: !!ee && ee.responseCount >= 50,
    hasActivePulse,
    engagePulseResponses,
    engagePulseInvited,
    engagePulseResponseRate,
    engagePulseFrequencyDays: 365,
    hasLifecycle: hasLifecycleResponses,
    lifecycleResponses: lifecycle.reduce((sum, p) => sum + p.responseCount, 0),
    has360: false,
    hasResponseClarity: false,
    hasAdaptiveFollowUp: false,
    dashboardViews: 18,
    hasManagerAssistDashboard: false,
    hasTextIQ: false,
    hasBenchmarkWidgets: false,
    hasStatsIQ: false,
    hasCommentSummaries: false,
    hasQualtricsAssist: false,
    hasInsightsExplorer: false,
    hasEJADataModel: false,
    hasEJADashboard: false,
    hasAttritionAnalytics: false,
    hasCrossXM: false,
    hasAIPoweredTopics: false,
    hasWorkflows: false,
    actionPlansCreated: 0,
    ideaBoardsCreated: 0,
    hasPersonalizedActions: false,
    hasWorkflowIntegration: false,
  };
}

// ---------------------------------------------------------------------------
// Outcome-focused recommendation generation
// ---------------------------------------------------------------------------
export function generateGrowthActions(projects: Project[]): GrowthAction[] {
  const state = deriveAccountState(projects);
  const actions: GrowthAction[] = [];
  const ee = projects.find(p => p.type === 'employee_engagement');

  // ========= LISTEN =========

  // Listening frequency: tier on annual engagement response rate. Engagement
  // is framed as the *comprehensive* listening program that reaches all
  // employees; Pulse is framed as a *sampled* supplement on a monthly cadence
  // (e.g. 5% of the population each month, a small set of high-priority
  // questions). Both surfaces — the home nudge (HomeListeningNudge.tsx) and
  // the EX Growth tab — read from the same tier:
  //
  //   <  30%  → fix the existing engagement program first
  //   <  70%  → add Pulse to supplement (full annual isn't reaching enough
  //              people; sampled cadence builds a parallel signal)
  //   <  85%  → expand engagement to biannual + offer Pulse as complement
  //   >= 85%  → expand engagement to quarterly + offer Pulse as complement
  //
  // At mid/high tiers we recommend BOTH the engagement-frequency expansion
  // AND a Pulse complement, because the canonical mature state is "annual (or
  // more frequent) engagement + monthly Pulse on top." Pulse cards are
  // skipped if an active Pulse already exists.
  if (state.engagePulseFrequencyDays > 183) {
    const rr = state.engagePulseResponseRate;
    const pct = Math.round(rr * 100);

    if (rr < 0.30) {
      actions.push({
        id: 'improve-existing-program',
        title: 'Improve your annual program before expanding listening',
        description: `Your annual engagement survey is at ${pct}% response, well below where a healthy program lands. Tightening invite cadence, comms, and survey design typically lifts participation before you take on a second cycle.`,
        category: 'listen',
        ctaLabel: 'Start Improvement Review',
      });
    } else if (rr < 0.70) {
      // Low-but-not-broken RR: Pulse is the right supplement. If they
      // already have one running, this tier is silent — adding more
      // cycles on top of a low-response annual won't help, and Pulse
      // is already covering the gap-fill role.
      if (!state.hasActivePulse) {
        actions.push({
          id: 'add-pulse-supplement',
          title: 'Add a Pulse program to supplement your annual engagement',
          description: `Your annual ran at ${pct}% response with ${state.engagePulseResponses.toLocaleString()} respondents. Layering on another full cycle won't help if the comprehensive survey isn't reaching enough people. Pulse takes a different approach: a short, focused set of questions sent to a small sample of employees each month (typically ~5% of the population), so you maintain a steady signal between annuals without asking more of any one employee.`,
          category: 'listen',
          ctaLabel: 'Enable Pulse',
        });
      }
    } else if (rr < 0.85) {
      actions.push({
        id: 'add-biannual-cadence',
        title: 'Expand your engagement program from annual to biannual',
        description: `Your ${pct}% response rate shows your population is bought in. A second engagement cycle six months out gives you twice the listening touchpoints from the license you already pay for, without fatiguing respondents.`,
        category: 'listen',
        ctaLabel: 'Configure Biannual Cadence',
      });
      if (!state.hasActivePulse) {
        actions.push({
          id: 'add-pulse-complement',
          title: 'Layer on a Pulse program to track between engagement cycles',
          description: 'A strong engagement program tells you where you stand. A monthly Pulse - sampling roughly 5% of the population at a time with a small set of priority questions - keeps a finger on the few metrics you most want to watch in between, without adding to anyone\'s survey load.',
          category: 'listen',
          ctaLabel: 'Enable Pulse',
        });
      }
    } else {
      actions.push({
        id: 'add-quarterly-cadence',
        title: 'Expand your engagement program from annual to quarterly',
        description: `Your ${pct}% response rate is exceptional, which is exactly when expanding engagement to quarterly delivers outsized value. Same license, four times the data points per year, no extra ask of any one employee.`,
        category: 'listen',
        ctaLabel: 'Configure Quarterly Cadence',
      });
      if (!state.hasActivePulse) {
        actions.push({
          id: 'add-pulse-complement',
          title: 'Layer on a Pulse program to track between engagement cycles',
          description: 'Even with quarterly engagement, a monthly Pulse - sampling roughly 5% of the population at a time with a small set of priority questions - keeps a finger on the few metrics you most want to watch in between, without adding to anyone\'s survey load.',
          category: 'listen',
          ctaLabel: 'Enable Pulse',
        });
      }
    }
  }

  // Multi-rater feedback for leadership development (independent of cadence)
  if (!state.has360) {
    actions.push({
      id: 'add-360',
      title: 'Add multi-rater feedback for leadership development',
      description: 'Engagement and pulse surveys show how teams feel, but not how individual leaders are perceived. 360 feedback fills that gap with direct, actionable input for managers.',
      category: 'listen',
      ctaLabel: 'Learn More About 360',
    });
  }

  // Lifecycle listening: capture key moments
  if (!state.hasLifecycle) {
    actions.push({
      id: 'add-lifecycle',
      title: 'Capture feedback at key employee moments',
      description: 'Engagement surveys tell you how people feel right now, but onboarding and exit surveys reveal why people stay or leave. Listening at these moments catches what annual surveys miss.',
      category: 'listen',
      ctaLabel: 'Explore Lifecycle Surveys',
    });
  } else if (state.lifecycleResponses < 50) {
    actions.push({
      id: 'grow-lifecycle',
      title: 'Expand listening across more employee moments',
      description: `You're collecting lifecycle feedback, but with ${state.lifecycleResponses} responses it's hard to spot patterns. Adding more touchpoints, like candidate experience or internal transfers, builds a more complete picture.`,
      category: 'listen',
      ctaLabel: 'Add Touchpoints',
    });
  }

  // Richer responses: Response Clarity or Adaptive Follow-Up
  if (!state.hasResponseClarity && !state.hasAdaptiveFollowUp && state.hasEngagePulse) {
    actions.push({
      id: 'richer-responses',
      title: 'Get more actionable open-ended responses',
      description: 'Open-ended feedback is only useful when it\'s specific. These features help employees give clearer, more detailed answers so you get insights you can actually act on.',
      category: 'listen',
      options: [
        {
          id: 'enable-response-clarity',
          label: 'Response Clarity',
          description: 'Gently guides employees to add detail and specifics when their answers are too vague. Works in the background so respondents barely notice it.',
          ctaLabel: 'Enable Response Clarity',
        },
        {
          id: 'enable-adaptive-followup',
          label: 'Conversational follow-ups',
          description: 'The survey adapts in real time. When an employee mentions a topic, it asks a targeted follow-up question to dig into the root cause.',
          ctaLabel: 'Enable Follow-ups',
        },
      ],
    });
  }

  // ========= UNDERSTAND =========

  // Text analysis: Text iQ
  if (!state.hasTextIQ && ee?.hasOpenEndedResponses) {
    const commentCount = ee.insights?.totalComments ?? 0;
    actions.push({
      id: 'enable-text-analysis',
      title: 'Unlock insights from open-ended feedback',
      description: commentCount > 0
        ? `You have ${commentCount.toLocaleString()} open-ended responses that aren't being analyzed. Enabling text analysis automatically surfaces the themes and sentiment in those comments, turning freeform text into structured, actionable data.`
        : 'Your survey collects open-ended responses, but they\'re not being analyzed. Text analysis uses AI to reveal what employees are really saying: the themes, the sentiment, and the trends.',
      category: 'understand',
      ctaLabel: 'Set Up Text iQ',
    });
  }

  // Qualtrics Assist: standalone card so it always surfaces prominently
  if (!state.hasQualtricsAssist) {
    actions.push({
      id: 'try-qualtrics-assist',
      title: 'Ask your data questions in plain language',
      description: 'Instead of building reports, just ask. Qualtrics Assist lets you type a question like "Which teams have the lowest manager scores?" and get an instant, cited answer from your results.',
      category: 'understand',
      ctaLabel: 'Try Qualtrics Assist',
    });
  }

  // Getting results to the right people: dashboard views + manager dashboards
  if (state.dashboardViews < 25 || !state.hasManagerAssistDashboard) {
    actions.push({
      id: 'broaden-results-access',
      title: 'Get results into the hands of people who can act',
      description: state.dashboardViews < 25
        ? `Your dashboard has only ${state.dashboardViews} views. Results are most powerful when the people closest to the work can see them. Broadening access builds accountability and speeds up action.`
        : 'Your admin team is viewing results, but managers don\'t have access to their own team\'s data yet. Giving them a view builds ownership and drives local action.',
      category: 'understand',
      options: [
        ...(!state.hasManagerAssistDashboard ? [{
          id: 'setup-manager-dashboards',
          label: 'Manager dashboards',
          description: 'Give each manager a filtered view of their team\'s results with built-in confidentiality thresholds. They see their data, and only their data.',
          ctaLabel: 'Set Up Manager Dashboards',
        }] : []),
        ...(state.dashboardViews < 25 ? [{
          id: 'share-dashboard',
          label: 'Share your dashboard more broadly',
          description: 'Send a dashboard digest or schedule a results review session. Getting more eyes on the data turns passive collection into active conversation.',
          ctaLabel: 'Share Dashboard',
        }] : []),
      ],
    });
  }

  // Add context to scores: benchmarks or Stats iQ
  if (!state.hasBenchmarkWidgets || !state.hasStatsIQ) {
    actions.push({
      id: 'add-context-to-scores',
      title: 'Understand what your scores actually mean',
      description: 'Raw scores don\'t tell you much on their own. Is 72% engagement good? What\'s actually driving it? Adding context turns numbers into decisions.',
      category: 'understand',
      options: [
        ...(!state.hasBenchmarkWidgets ? [{
          id: 'enable-benchmarks',
          label: 'Engagement benchmarks',
          description: 'Compare your scores against organizations of similar size and industry. Instantly see where you\'re ahead and where you\'re behind.',
          ctaLabel: 'Enable Benchmarks',
        }] : []),
        ...(!state.hasStatsIQ ? [{
          id: 'try-statsiq',
          label: 'Key driver analysis',
          description: 'Stats iQ identifies which factors actually drive engagement, not just which scores are low. Helps you focus effort where it matters most.',
          ctaLabel: 'Run Stats iQ',
        }] : []),
      ],
    });
  }

  // AI-powered understanding: Comment Summaries, Insights Explorer
  // (Qualtrics Assist has its own standalone card above)
  const missingAI = [
    !state.hasCommentSummaries,
    !state.hasInsightsExplorer,
  ].filter(Boolean).length;

  if (missingAI > 0) {
    actions.push({
      id: 'ai-powered-insights',
      title: 'Let AI summarize and narrate your results',
      description: 'Instead of manually reading every comment or building reports from scratch, let AI do the heavy lifting by surfacing key themes and generating ready-to-share narratives.',
      category: 'understand',
      options: [
        ...(!state.hasCommentSummaries ? [{
          id: 'enable-comment-summaries',
          label: 'Comment summaries',
          description: 'AI reads all open-ended responses and generates a concise summary for each theme. Managers get the key takeaways in seconds.',
          ctaLabel: 'Enable Comment Summaries',
        }] : []),
        ...(!state.hasInsightsExplorer ? [{
          id: 'explore-insights-explorer',
          label: 'Insights Explorer',
          description: 'Automatically generates narrative reports from your data, ready to share with leadership. Turns numbers into stories that drive decisions.',
          ctaLabel: 'Explore',
        }] : []),
      ],
    });
  }

  // Cross-program understanding: EJA, Attrition, Cross XM
  if (state.hasLifecycle && state.hasEngagePulse) {
    const missingCross = [
      !state.hasEJADataModel,
      !state.hasAttritionAnalytics,
      !state.hasCrossXM,
    ].filter(Boolean).length;

    if (missingCross > 0) {
      actions.push({
        id: 'connect-data-across-programs',
        title: 'Connect your data for a complete employee picture',
        description: 'You have engagement and lifecycle data collecting separately. Connecting them reveals patterns that neither survey shows on its own, like which onboarding experiences predict long-term engagement.',
        category: 'understand',
        options: [
          ...(!state.hasEJADataModel ? [{
            id: 'setup-eja',
            label: 'Employee Journey Analytics',
            description: 'Links your engagement, lifecycle, and 360 data into a unified model. See how the employee experience connects from hire to exit.',
            ctaLabel: 'Set Up EJA',
          }] : []),
          ...(!state.hasAttritionAnalytics ? [{
            id: 'enable-attrition-analytics',
            label: 'Attrition prediction',
            description: 'Uses engagement data to identify which teams or segments are at highest risk of turnover so you can intervene before people leave.',
            ctaLabel: 'Enable',
          }] : []),
          ...(!state.hasCrossXM ? [{
            id: 'explore-crossxm',
            label: 'Cross XM analytics',
            description: 'Connects employee experience data with customer experience data to show how engagement impacts business outcomes.',
            ctaLabel: 'Learn More',
          }] : []),
        ],
      });
    }
  }

  // ========= ACT =========

  // Turn insights into concrete improvements
  if (state.actionPlansCreated < 5 || state.ideaBoardsCreated < 5) {
    actions.push({
      id: 'drive-improvement',
      title: 'Turn insights into concrete improvements',
      description: 'Survey data only creates value when someone acts on it. Give managers structured tools to move from "we heard you" to "here\'s what we\'re doing about it."',
      category: 'act',
      options: [
        ...(state.actionPlansCreated < 5 ? [{
          id: 'create-action-plans',
          label: 'Action plans',
          description: `Structured plans that let managers set goals, assign owners, and track progress against their team's feedback.${state.actionPlansCreated > 0 ? ` You have ${state.actionPlansCreated} so far.` : ''}`,
          ctaLabel: 'Enable Action Planning',
        }] : []),
        ...(state.ideaBoardsCreated < 5 ? [{
          id: 'setup-idea-boards',
          label: 'Idea Boards',
          description: 'Let employees propose and vote on improvement ideas. Turns feedback into a two-way conversation where employees feel heard and managers get practical suggestions.',
          ctaLabel: 'Create Idea Board',
        }] : []),
      ],
    });
  }

  // Automate responses
  if (!state.hasWorkflows) {
    actions.push({
      id: 'automate-responses',
      title: 'Automate follow-ups so nothing falls through the cracks',
      description: 'Set up automated triggers that respond to survey signals, like notifying HR when a team\'s score drops below a threshold, or sending a thank-you when engagement is high.',
      category: 'act',
      ctaLabel: 'Create Workflow',
    });
  }

  // Personalized Action Recommendations: standalone card in ACT
  if (!state.hasPersonalizedActions) {
    actions.push({
      id: 'personalized-action-recs',
      title: 'Get AI-recommended actions tailored to each manager',
      description: 'Instead of every manager getting the same generic suggestions, personalized recommendations analyze each team\'s results and surface specific, evidence-based actions that fit their situation.',
      category: 'act',
      ctaLabel: 'Enable Personalized Recommendations',
    });
  }

  // Workflow integrations (L3)
  if (state.actionPlansCreated >= 5 && !state.hasWorkflowIntegration) {
    actions.push({
      id: 'workflow-integration',
      title: 'Connect action-taking to the tools your teams already use',
      description: 'You\'re already creating action plans. Connecting workflows to Slack, Teams, Jira, and other tools puts follow-through where people actually work, with no extra logins required.',
      category: 'act',
      ctaLabel: 'Add Integration',
    });
  }

  return actions;
}
