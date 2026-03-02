# Text iQ Insight Surfacing — XM Advisor Prototype

A proof-of-concept prototype demonstrating proactive insight surfacing for Qualtrics. The goal is to surface Text iQ insights to users who have open-ended survey response data but haven't configured text analysis — guiding them through setup without requiring them to find the feature themselves.

## Problem

Users collecting open-ended survey responses often don't realize the value of text analysis or don't know how to set it up. Valuable qualitative data sits unanalyzed, sentiment trends go unnoticed, and Text iQ adoption stays low.

## Solution: XM Advisor

**XM Advisor** is a personalized recommendation system that:

1. Detects unanalyzed open-ended responses in a project
2. Surfaces contextual nudges at relevant touchpoints (overview page, widget picker)
3. Teases specific insights (e.g., "49 responses mentioning Work-Life Balance") to create urgency
4. Guides users through Text iQ setup with a clear call-to-action

## Features

- **Overview page** with XM Advisor nudge highlighting unanalyzed responses and a preview insight
- **Dashboard list and detail views** with heatmap widgets (EX25 categories by department)
- **Add Widget modal** where Text iQ widgets appear disabled with an Advisor nudge explaining why
- **Text iQ setup modal** with guided experience
- **200 mock employee comments** with theme extraction and sentiment analysis

## Tech Stack

- React + TypeScript
- Vite
- Lucide React (icons)
- CSS with Qualtrics design system variables
- Deployed on Vercel

## Running Locally

```bash
npm install
npm run dev
```

## Building

```bash
npm run build
```

Output goes to `dist/`.

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for detailed architecture, data model, and user flows.
