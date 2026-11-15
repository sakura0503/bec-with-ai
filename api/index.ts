import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

type ScenarioId = "synthetic-phish" | "voice-clone" | "automated-recon" | "email-triage";
type Run = { id: string; scenario: ScenarioId; startedAt: string; events: string[] };

const runs = new Map<string, Run>();
const scenarios: Record<ScenarioId, { title: string; category: string; risk: string }> = {
  "synthetic-phish": { title: "Synthetic phishing", category: "Generative social engineering", risk: "High" },
  "voice-clone": { title: "Voice clone callback", category: "Deepfake impersonation", risk: "Critical" },
  "automated-recon": { title: "Automated reconnaissance", category: "AI-assisted discovery", risk: "Medium" },
  "email-triage": { title: "Email triage", category: "BEC red-flag detection", risk: "High" }
};

const json = (res: ServerResponse, status: number, data: unknown) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(data));
};

const readBody = async (req: IncomingMessage): Promise<Record<string, unknown>> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  if (!chunks.length) return {};
  try {
    const value: unknown = JSON.parse(Buffer.concat(chunks).toString());
    return value !== null && typeof value === "object" ? value as Record<string, unknown> : {};
  } catch {
    return {};
  }
};

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const path = new URL(req.url ?? "/", "http://localhost").pathname;
  const method = req.method ?? "GET";

  if (method === "GET" && path === "/api/health") {
    json(res, 200, { status: "ok", service: "red-team-lab-api", mode: "safe-simulation" });
    return;
  }
  if (method === "GET" && path === "/api/scenarios") {
    json(res, 200, Object.entries(scenarios).map(([id, value]) => ({ id, ...value })));
    return;
  }
  if (method === "POST" && path === "/api/runs") {
    const body = await readBody(req);
    const scenario = body.scenario;
    if (typeof scenario !== "string" || !(scenario in scenarios)) {
      json(res, 400, { error: "Choose a supported scenario." });
      return;
    }
    const run: Run = { id: randomUUID(), scenario: scenario as ScenarioId, startedAt: new Date().toISOString(), events: ["run-created"] };
    runs.set(run.id, run);
    json(res, 201, { run, scenario: scenarios[run.scenario] });
    return;
  }

  const eventMatch = path.match(/^\/api\/runs\/([^/]+)\/events$/);
  if (method === "POST" && eventMatch) {
    const run = runs.get(eventMatch[1]);
    const body = await readBody(req);
    if (!run) {
      json(res, 404, { error: "Simulation run not found." });
      return;
    }
    if (typeof body.event !== "string" || body.event.length < 2 || body.event.length > 80) {
      json(res, 400, { error: "Event must be a short label." });
      return;
    }
    run.events.push(body.event);
    json(res, 200, { run });
    return;
  }

  json(res, 404, { error: "Route not found." });
}
