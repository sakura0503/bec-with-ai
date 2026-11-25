# AI-Enhanced Business Email Compromise

This website is an interactive, controlled simulation for learning about Business Email Compromise (BEC), especially how AI can enhance phishing, impersonation, and reconnaissance. It provides Red Team and Blue Team perspectives, fictional scenarios, threat signals, telemetry, and safe defensive decision-making without contacting real targets or sending real messages.

API: Custom REST API for the simulation, with optional server-side OpenRouter scenario generation:
- `GET /api/health` — checks that the safe-simulation service is running.
- `GET /api/scenarios` — returns the available fictional BEC scenarios and their risk levels.
- `POST /api/scenarios/generate` — requests a fresh, safety-checked fictional variation from OpenRouter.
- `POST /api/runs` — creates an in-memory simulation run for a selected scenario.
- `POST /api/runs/:runId/events` — records short telemetry events for an active simulation run.

Frontend: HTML, CSS, and vanilla JavaScript

Backend: Node.js HTTP server and TypeScript serverless API; stores simulation runs in memory only.

Deployment: Vercel

## Optional OpenRouter scenario generation

The scenario library works without an API key using its saved fictional samples. To generate a fresh, safety-checked variation when a scenario opens, configure an OpenRouter API key on the server. The key is never needed in the browser. The default model is `recursive/flint-v1.0:free`; free-model availability and rate limits may vary.

### Local development (Windows PowerShell)

Set `OPENROUTER_API_KEY` in a local `.env` file (and optionally set `OPENROUTER_MODEL`), then start the app:

```env
OPENROUTER_API_KEY=your-key
OPENROUTER_MODEL=recursive/flint-v1.0:free
```

```powershell
npm run dev
```

The `.env` file is ignored by Git. Never add the key to `public/app.js`, commit it, or send it in chat. Without the key, the app continues to use its saved samples.

### Vercel

In the Vercel project, open **Settings → Environment Variables**, add `OPENROUTER_API_KEY`, and select the environments where it should be available. Redeploy after saving the variable. Keep the key server-side; do not use a `NEXT_PUBLIC_` variable. To select a different OpenRouter model, set `OPENROUTER_MODEL`; non-free model IDs may incur charges.

Generation is limited to 10 requests per minute per server process, in addition to OpenRouter's free-model limits. The in-memory limit is best-effort on serverless deployments. Generated material is constrained to fictional, non-operational training content; scenario actions and answer keys remain fixed in the app.

Created by: Shamym Iftikhar, Ruwail Fatima, Romaisa Fatima

Website: [bec-with-ai.vercel.app](https://bec-with-ai.vercel.app)