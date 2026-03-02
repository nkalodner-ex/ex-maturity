# Text iQ Insight Surfacing Orchestration Agent

## Project Overview

This project is a **proof-of-concept prototype** demonstrating a proactive insight surfacing system for Qualtrics. The goal is to surface Text iQ insights to users who have open-ended survey response data but haven't yet configured Text iQ analysis—guiding them through setup without requiring them to navigate to the feature themselves.

## Problem Statement

Users collecting open-ended survey responses often don't realize the value of Text iQ analysis or don't know how to set it up. This results in:
- Valuable qualitative data sitting unanalyzed
- Missed insights about employee sentiment and emerging themes
- Lower feature adoption for Text iQ

## Solution: XM Advisor

We created **XM Advisor**, a personalized recommendation system that:
1. Proactively analyzes survey data to identify opportunities
2. Surfaces contextual nudges at relevant touchpoints in the product
3. Guides users through feature configuration with a clear call-to-action
4. Emphasizes that recommendations are personalized ("Based on your survey data")

## Key Features Built

### 1. Overview Page with XM Advisor Nudge
- Matches Qualtrics UI exactly (header, tabs, setup sections)
- Displays XM Advisor nudge when Text iQ is not configured
- Subtitle: "Unanalyzed feedback detected"
- Explains that open-ended responses exist but no text analysis is set up
- Teases a specific topic insight (e.g., "49 responses mentioning Work-Life Balance") to create urgency
- CTA: "Set up Text iQ" opens guided setup modal

### 2. Dashboard List View
- Shows existing dashboards with metadata (widget count, last modified)
- "Create Dashboard" button for new dashboards
- Click-to-enter interaction pattern

### 3. Dashboard Detail View with Heatmap Widgets
- Heatmap widgets showing scores across EX25 categories by department
- Color-coded change indicators (green = positive, red = negative)
- Favorability bars for quick visual assessment
- "Add Widget" button to add new widgets

### 4. Add Widget Modal with XM Advisor Integration
- Categorized widget options (Charts, Table, Analysis, Action Planning, Static Content, Other)
- **Text iQ widgets are grayed out/disabled** when Text iQ is not configured:
  - Text iQ Bubble Chart
  - Text iQ Table
  - New Word Cloud
- XM Advisor nudge appears in modal explaining why widgets are unavailable
- CTA: "Start Guided Setup" emphasizes the guided experience

### 5. Text iQ Setup Modal
- Explains Text iQ benefits
- Lists key features (theme discovery, sentiment analysis, visualizations)
- "Start Setup" and "Maybe Later" options

## Technical Architecture

### Stack
- **React 18** with TypeScript
- **Vite** for build tooling
- **Lucide React** for icons
- **CSS** with Qualtrics design system variables

### Key Files
```
src/
├── App.tsx                      # Main app with tab navigation and state management
├── components/
│   ├── HeatmapWidget.tsx        # Heatmap visualization component
│   └── AddWidgetModal.tsx       # Widget picker with XM Advisor nudge
├── data/
│   ├── mockProjects.ts          # Mock project data with insights
│   ├── mockHeatmapData.ts       # Mock heatmap category data
│   └── mock_comments.csv        # 200 mock employee comments
├── styles/
│   └── qualtrics.css            # Qualtrics XM design system
├── types/
│   └── index.ts                 # TypeScript interfaces
└── utils/
    └── insightGenerator.ts      # Theme extraction and sentiment analysis
```

### Data Model

**ThemeInsight:**
```typescript
{
  name: string;              // e.g., "Work-Life Balance"
  count: number;             // Number of comments
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;    // -1 to 1
  sentimentTrend: 'improving' | 'declining' | 'stable';
  sentimentChange: number;   // Percentage change from last period
}
```

**EX25 Themes Used:**
- Manager Effectiveness
- Growth & Development
- Work-Life Balance
- Recognition & Respect
- Collaboration

## User Flows

### Flow 1: Overview Page → Text iQ Setup
1. User lands on Overview tab
2. XM Advisor nudge shows insight about their data
3. User clicks "Set up Text iQ"
4. Setup modal opens with guided experience

### Flow 2: Dashboard → Add Widget → Text iQ Setup
1. User navigates to Dashboards tab
2. User selects a dashboard
3. User clicks "Add Widget"
4. Modal shows available widgets with Text iQ options grayed out
5. XM Advisor nudge explains why and offers "Start Guided Setup"
6. User clicks CTA, modal closes, Text iQ setup opens

## XM Advisor Design Principles

1. **Branded & Recognizable**: Purple badge with sparkle icon, consistent across touchpoints
2. **Personalized**: "Unanalyzed feedback detected" / "Recommendation" subtitles
3. **Contextual**: Appears at relevant moments (viewing data, adding widgets)
4. **Actionable**: Clear CTA with guided experience promise
5. **Non-intrusive**: Dismissible, doesn't block workflows
6. **Informative**: Explains the "why" (what's unavailable, what you'll unlock)

## Current State

### What's Working
- Full UI matching Qualtrics design system
- Tab navigation between Overview and Dashboards
- Dashboard list → detail view flow
- Heatmap widgets with mock data
- Add Widget modal with categorized options
- XM Advisor nudges in both Overview and Add Widget modal
- Text iQ setup modal

### What's Simulated/Mock
- All data is static mock data
- No actual Text iQ API integration
- No actual widget rendering beyond heatmaps
- Dashboard creation doesn't persist
- Theme extraction uses simulated trends

## Future Considerations

1. **Additional XM Advisor Touchpoints**:
   - Data & Analysis tab when viewing responses
   - Survey builder when adding open-ended questions
   - Reports section

2. **Personalization Enhancements**:
   - Trigger based on response volume thresholds
   - Time-based nudges (e.g., after survey closes)
   - Role-based recommendations

3. **Guided Setup Flow**:
   - Multi-step wizard for Text iQ configuration
   - Preview of what insights will look like
   - Estimated time to complete

4. **Analytics**:
   - Track nudge impressions and CTR
   - Measure Text iQ adoption lift
   - A/B test messaging variations

## Running the Project

```bash
# Clone and install
git clone <repo-url>
cd textIQ-orchestration
npm install

# Development
npm run dev

# Build
npm run build
```

## Branch
`claude/text-iQ-insight-surfacing-QVy2Q`
