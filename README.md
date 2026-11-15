# AI-Enhanced Business Email Compromise

This website is an interactive, controlled simulation for learning about Business Email Compromise (BEC), especially how AI can enhance phishing, impersonation, and reconnaissance. It provides Red Team and Blue Team perspectives, fictional scenarios, threat signals, telemetry, and safe defensive decision-making without contacting real targets or sending real messages.

API: Custom REST API (no external API) built for the simulation:
- `GET /api/health` — checks that the safe-simulation service is running.
- `GET /api/scenarios` — returns the available fictional BEC scenarios and their risk levels.
- `POST /api/runs` — creates an in-memory simulation run for a selected scenario.
- `POST /api/runs/:runId/events` — records short telemetry events for an active simulation run.

Frontend: HTML, CSS, and vanilla JavaScript

Backend: Node.js HTTP server and TypeScript serverless API; stores simulation runs in memory only.

Deployment: Vercel

Created by: Shamym Iftikhar, Ruwail Fatima, Romaisa Fatima

Website: bec-with-ai.vercel.app