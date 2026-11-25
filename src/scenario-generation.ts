export type ScenarioId =
  | "synthetic-phish"
  | "voice-clone"
  | "automated-recon"
  | "email-triage"
  | "vendor-change"
  | "payroll-change";

export type Perspective = "red" | "blue";

export type GeneratedScenario = {
  title: string;
  evidence: string;
  clues: [string, string, string];
  email?: [string, string, string, string];
};

type ScenarioDefinition = {
  title: string;
  category: string;
  kind: "email" | "call" | "recon";
  safeFocus: string;
};

const scenarioDefinitions: Record<ScenarioId, ScenarioDefinition> = {
  "synthetic-phish": {
    title: "Synthetic phishing",
    category: "Generative social engineering",
    kind: "email",
    safeFocus: "identify an unverified supplier request and use an established verification channel"
  },
  "voice-clone": {
    title: "Voice clone callback",
    category: "Deepfake impersonation",
    kind: "call",
    safeFocus: "pause an unusual caller request and verify it through a known callback route"
  },
  "automated-recon": {
    title: "Automated reconnaissance",
    category: "AI-assisted discovery",
    kind: "recon",
    safeFocus: "review only synthetic public-information categories and recommend exposure reduction"
  },
  "email-triage": {
    title: "Email triage",
    category: "BEC red-flag detection",
    kind: "email",
    safeFocus: "identify sender, urgency, sensitive-change, and verification warning signs"
  },
  "vendor-change": {
    title: "Vendor change request",
    category: "Supplier verification",
    kind: "email",
    safeFocus: "hold a fictional supplier-record change until independently verified and approved"
  },
  "payroll-change": {
    title: "Payroll change review",
    category: "Payroll controls",
    kind: "email",
    safeFocus: "hold a fictional employee-record change until verified through an established HR process"
  }
};

const generationWindows = new Map<string, { count: number; resetsAt: number }>();
const generationLimit = 10;
const generationWindowMs = 60_000;
const unsafeText = /(?:https?:\/\/|www\.|password|passcode|credentials?|one[- ]time code|verification code|access token|routing number|account number|click here|wire transfer|bypass approval|disable security|\b\d{6,}\b|\b[\w.-]+@[\w.-]+\.(?:com|net|org|io)\b)/i;

export class ScenarioGenerationError extends Error {
  constructor(readonly statusCode: number, message: string) {
    super(message);
    this.name = "ScenarioGenerationError";
  }
}

export const isScenarioId = (value: unknown): value is ScenarioId =>
  typeof value === "string" && Object.hasOwn(scenarioDefinitions, value);

export const isPerspective = (value: unknown): value is Perspective =>
  value === "red" || value === "blue";

export const allowScenarioGeneration = (clientId: string): boolean => {
  const now = Date.now();
  for (const [key, window] of generationWindows) {
    if (window.resetsAt <= now) generationWindows.delete(key);
  }

  const current = generationWindows.get(clientId);
  if (!current || current.resetsAt <= now) {
    generationWindows.set(clientId, { count: 1, resetsAt: now + generationWindowMs });
    return true;
  }
  if (current.count >= generationLimit) return false;
  current.count += 1;
  return true;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const extractText = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (!Array.isArray(value)) return "";
  return value.reduce<string>((text, part) => {
    if (typeof part === "string") return text + part;
    return isRecord(part) && typeof part.text === "string" ? text + part.text : text;
  }, "");
};

const parseJsonText = (text: string): unknown => {
  const normalized = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(normalized);
  } catch {
    const start = normalized.indexOf("{");
    const end = normalized.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("No JSON object found.");
    return JSON.parse(normalized.slice(start, end + 1));
  }
};

const safeText = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxLength &&
  !unsafeText.test(value);

const recipientFor = (scenario: ScenarioId): string =>
  scenario === "payroll-change" ? "payroll@example.test" : "finance@example.test";

const senderFor = (scenario: ScenarioId): string =>
  scenario === "payroll-change"
    ? "People Operations <people@example.test>"
    : scenario === "vendor-change"
      ? "Vendor Records <records@example.test>"
      : "Accounts Team <accounts@example.test>";

const validateOutput = (value: unknown, scenario: ScenarioId): GeneratedScenario => {
  if (!isRecord(value) ||
      !safeText(value.title, 80) ||
      !safeText(value.evidence, 280) ||
      !Array.isArray(value.clues) ||
      value.clues.length !== 3 ||
      !value.clues.every((clue) => safeText(clue, 110))) {
    throw new ScenarioGenerationError(502, "OpenRouter returned scenario content in an unsupported format.");
  }

  const definition = scenarioDefinitions[scenario];
  const clues = value.clues as [string, string, string];
  if (definition.kind !== "email") {
    if (value.email !== null) {
      throw new ScenarioGenerationError(502, "OpenRouter returned an unexpected email for this scenario.");
    }
    return { title: value.title, evidence: value.evidence, clues };
  }

  if (!isRecord(value.email) ||
      !safeText(value.email.subject, 100) ||
      !safeText(value.email.body, 600)) {
    throw new ScenarioGenerationError(502, "OpenRouter returned email content that failed the training-safety checks.");
  }

  return {
    title: value.title,
    evidence: value.evidence,
    clues,
    email: [
      senderFor(scenario),
      recipientFor(scenario),
      value.email.subject,
      value.email.body
    ]
  };
};

export const generateScenario = async (
  scenario: ScenarioId,
  perspective: Perspective
): Promise<GeneratedScenario> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new ScenarioGenerationError(503, "AI generation is not configured. Add OPENROUTER_API_KEY on the server.");
  }

  const definition = scenarioDefinitions[scenario];
  const emailInstruction = definition.kind === "email"
    ? 'Include an email object with only "subject" and "body". The server supplies a fixed fictional sender and recipient. The body must clearly be a training sample, request no real action, and recommend independent verification.'
    : "Set email to null.";
  const emailShape = definition.kind === "email" ? '{"subject":"short fictional subject","body":"short training-only message"}' : "null";
  const userPrompt = `Create one fresh, fictional ${perspective === "red" ? "Red Team tabletop" : "Blue Team defensive"} training scenario for topic "${definition.title}" (${definition.category}). Its safe learning focus is: ${definition.safeFocus}. Return only valid JSON with this shape: {"title":"short scenario title","evidence":"short fictional case summary","clues":["defensive cue one","defensive cue two","defensive cue three"],"email":${emailShape}}. ${emailInstruction} Never include real organizations or people, URLs, phone numbers, credentials, numeric payment details, instructions to evade controls, or text designed to persuade someone to act. Do not generate actions, answer choices, or an answer key.`;
  const emailSchema = {
    type: "object",
    properties: {
      subject: { type: "string", maxLength: 100 },
      body: { type: "string", maxLength: 600 }
    },
    required: ["subject", "body"],
    additionalProperties: false
  };
  const outputSchema = {
    type: "object",
    properties: {
      title: { type: "string" },
      evidence: { type: "string" },
      clues: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 3 },
      email: definition.kind === "email" ? emailSchema : { type: "null" }
    },
    required: ["title", "evidence", "clues", "email"],
    additionalProperties: false
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || "recursive/flint-v1.0:free",
        messages: [
          {
            role: "system",
            content: "You create safe, fictional cybersecurity awareness materials for a contained training lab. Keep every output non-operational and defender-focused. Email samples are not sendable lures; they must not contain links, payment instructions, requests for credentials, or instructions to bypass verification. Respond in JSON."
          },
          { role: "user", content: userPrompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "safe_training_scenario", strict: true, schema: outputSchema }
        },
        max_tokens: 2000,
        temperature: 0.8,
        stream: false
      }),
      signal: controller.signal
    });
  } catch {
    throw new ScenarioGenerationError(502, "Could not reach OpenRouter. The saved training scenario remains available.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new ScenarioGenerationError(502, "OpenRouter rejected the server API key or access. Check the key and account settings.");
    }
    if (response.status === 402) {
      throw new ScenarioGenerationError(503, "OpenRouter requires credits or the selected model is not available on the free tier.");
    }
    if (response.status === 429) {
      throw new ScenarioGenerationError(503, "OpenRouter free-model rate limit reached. Try again later.");
    }
    if (response.status === 404) {
      throw new ScenarioGenerationError(503, "OpenRouter could not find an available model for this request. Try again later.");
    }
    throw new ScenarioGenerationError(502, `OpenRouter scenario generation failed (HTTP ${response.status}).`);
  }

  let providerResult: unknown;
  try {
    providerResult = await response.json();
  } catch {
    throw new ScenarioGenerationError(502, "OpenRouter returned an invalid response.");
  }
  const firstChoice = isRecord(providerResult) && Array.isArray(providerResult.choices)
    ? providerResult.choices[0]
    : null;
  const message = isRecord(firstChoice) && isRecord(firstChoice.message)
    ? extractText(firstChoice.message.content)
    : "";
  if (!message.trim()) {
    throw new ScenarioGenerationError(502, "OpenRouter returned an empty scenario.");
  }

  let generated: unknown;
  try {
    generated = parseJsonText(message);
  } catch {
    throw new ScenarioGenerationError(502, "OpenRouter returned scenario content that was not valid JSON.");
  }
  return validateOutput(generated, scenario);
};
