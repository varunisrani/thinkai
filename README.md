# ThinkAI Script-to-Screen Dashboard

ThinkAI is a film-preproduction front end that guides a script through analysis, summaries, character breakdowns, scheduling, budgeting, storyboards, and an overview.

## Core features

- Upload or paste a script and submit it to a remote processing API.
- Step-gated workflow for script analysis, scene one-liners, characters, schedules, budgets, and storyboards.
- Local browser storage for intermediate results and recovery when some API calls fail.
- Tabular and visual presentation of production data.
- Included sample JSON data for scripts, characters, schedules, and budgets.

## Technology stack

- React 18, TypeScript, and Vite 5
- React Router and TanStack React Query
- Tailwind CSS and shadcn/ui (Radix UI)
- Recharts, Lucide icons, and browser `localStorage`

## Prerequisites

- Node.js 20 or newer
- npm (a `package-lock.json` is included)
- Network access to the API endpoint currently compiled into the client

## Local setup

```bash
git clone https://github.com/varunisrani/thinkai.git
cd thinkai
npm ci
npm run dev
```

Other verified scripts are:

```bash
npm run build
npm run preview
npm run lint
```

## Configuration

The current source does not read environment variables. API base URLs are hard-coded in the service modules rather than configured at build or run time.

## Project structure

```text
src/pages/                  Main workflow and fallback page
src/components/TabContent/ Workflow stages
src/contexts/               Shared script-workflow state
src/services/               Remote API and browser-storage adapters
src/types/                  Script-domain types
*.json                      Sample production data
```

## Status and limitations

This repository contains only the browser client; it does not include the remote processing service. Most processing features therefore depend on external API availability and compatibility. Intermediate script and production data may be stored unencrypted in the browser's local storage. The source contains two service modules with different hard-coded API bases, so not every call path is guaranteed to target the same backend.