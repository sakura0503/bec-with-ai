import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import {
  allowScenarioGeneration,
  generateScenario,
  isPerspective,
  isScenarioId,
  ScenarioGenerationError,
  type ScenarioId
} from "./scenario-generation.js";

type Run = { id: string; scenario: ScenarioId; startedAt: string; events: string[] };

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const publicDir = join(root, "public");
const runs = new Map<string, Run>();
const scenarios: Record<ScenarioId, { title: string; category: string; risk: string }> = {
  "synthetic-phish": { title: "Synthetic phishing", category: "Generative social engineering", risk: "High" },
  "voice-clone": { title: "Voice clone callback", category: "Deepfake impersonation", risk: "Critical" },
  "automated-recon": { title: "Automated reconnaissance", category: "AI-assisted discovery", risk: "Medium" },
  "email-triage": { title: "Email triage", category: "BEC red-flag detection", risk: "High" },
  "vendor-change": { title: "Vendor change request", category: "Supplier verification", risk: "High" },
  "payroll-change": { title: "Payroll change review", category: "Payroll controls", risk: "High" }
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

const sendFile = async (res: ServerResponse, pathname: string) => {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(join(publicDir, requested));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const content = await readFile(filePath);
    const types: Record<string, string> = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8" };
    res.writeHead(200, { "Content-Type": types[extname(filePath)] ?? "application/octet-stream" });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const method = req.method ?? "GET";

  if (method === "GET" && url.pathname === "/api/health") {
    json(res, 200, { status: "ok", service: "red-team-lab-api", mode: "safe-simulation" });
    return;
  }
  if (method === "GET" && url.pathname === "/api/scenarios") {
    json(res, 200, Object.entries(scenarios).map(([id, value]) => ({ id, ...value })));
    return;
  }
  if (method === "POST" && url.pathname === "/api/scenarios/generate") {
    const body = await readBody(req);
    if (!isScenarioId(body.scenario)) {
      json(res, 400, { error: "Choose a supported scenario." });
      return;
    }
    if (!isPerspective(body.perspective)) {
      json(res, 400, { error: "Choose a supported team perspective." });
      return;
    }
    const forwardedFor = req.headers["x-forwarded-for"];
    const clientId = (typeof forwardedFor === "string" ? forwardedFor.split(",")[0].trim() : "") || req.socket.remoteAddress || "unknown";
    if (!allowScenarioGeneration(clientId)) {
      json(res, 429, { error: "Scenario generation limit reached. Try again in a minute." });
      return;
    }
    try {
      const scenario = await generateScenario(body.scenario, body.perspective);
      json(res, 200, { scenario, source: "openrouter" });
    } catch (error) {
      if (error instanceof ScenarioGenerationError) {
        json(res, error.statusCode, { error: error.message });
        return;
      }
      console.error("Scenario generation failed.", error);
      json(res, 502, { error: "Scenario generation failed. The saved training scenario remains available." });
    }
    return;
  }
  if (method === "POST" && url.pathname === "/api/runs") {
    const body = await readBody(req);
    const scenario = body.scenario;
    if (!isScenarioId(scenario)) {
      json(res, 400, { error: "Choose a supported scenario." });
      return;
    }
    const run: Run = { id: randomUUID(), scenario, startedAt: new Date().toISOString(), events: ["run-created"] };
    runs.set(run.id, run);
    json(res, 201, { run, scenario: scenarios[run.scenario] });
    return;
  }
  const eventMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/events$/);
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
  if (method === "GET") {
    await sendFile(res, url.pathname);
    return;
  }
  json(res, 404, { error: "Route not found." });
});

server.listen(Number(process.env.PORT ?? 3000), () => {
  console.log(`Red Team Lab running at http://localhost:${process.env.PORT ?? 3000}`);
});
