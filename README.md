# Project #6: Business Email Compromise enhanced by AI

Red Team Lab is a safe, controlled training interface for studying how AI can be misused in BEC campaigns: synthetic phishing, deepfake voice impersonation, and automated reconnaissance. It is designed for defender education and contains no real targets, message delivery, external integrations, or operational attack instructions.

## Run locally

Requires Node.js 18 or newer.

```bash
npm install
npm run build
npm start
```

Open `http://localhost:3000`.

## Deploy to Vercel

Import the repository into Vercel with the project root set to this folder. No custom build command or output directory is required; `vercel.json` maps the `public/` frontend and `api/index.ts` serverless function automatically.

## API

- `GET /api/health` — safe-simulation service health.
- `GET /api/scenarios` — available fictional research vectors.
- `POST /api/runs` — starts a contained run for a supported scenario.
- `POST /api/runs/:runId/events` — records a short local telemetry event.

Run state is held in memory and is intentionally not persisted.

The frontend uses URL hash navigation (`#scenarios`, `#signals`, `#telemetry`, `#playbook`, or `#settings`) so refreshing a page keeps the current workspace open.
