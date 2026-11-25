const state = { runId: null, scenario: null, variantIndex: 0, generatedScenario: null, scenarioInteracted: false, generationRequestId: 0, toastTimer: null };
const telemetryKey = "red-team-telemetry";
const scenarioIds = ["synthetic-phish", "voice-clone", "automated-recon", "email-triage", "vendor-change", "payroll-change"];
const scenarioLabels = {
  "synthetic-phish": "Synthetic phishing",
  "voice-clone": "Voice clone callback",
  "automated-recon": "Automated reconnaissance",
  "email-triage": "Email triage",
  "vendor-change": "Vendor change request",
  "payroll-change": "Payroll change review"
};
const chooseVariantIndex = (scenario) => {
  const key = `bec-last-variant-${getPerspective()}-${scenario}`;
  const previous = sessionStorage.getItem(key);
  const next = previous === "0" ? 1 : 0;
  sessionStorage.setItem(key, String(next));
  return next;
};
const getTelemetry = () => {
  try {
    const stored = JSON.parse(sessionStorage.getItem(telemetryKey) ?? "[]");
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};
const saveTelemetry = (events) => {
  try {
    sessionStorage.setItem(telemetryKey, JSON.stringify(events.slice(-50)));
  } catch {
    toast("Session history is unavailable in this browser.");
  }
};
const formatEvent = (event) => {
  const labels = {
    "scenario-opened": "Scenario opened",
    "defender-control-tested": "Defender control tested",
    "triage-success": "Email triage passed",
    "triage-fail": "Email triage failed"
  };
  if (labels[event]) return labels[event];
  if (event.startsWith("flags-")) return `Red flags reviewed · ${event.slice(6)} selected`;
  if (event.endsWith("-success")) return `${scenarioLabels[event.slice(0, -8)] ?? "Scenario"} passed`;
  if (event.endsWith("-fail")) return `${scenarioLabels[event.slice(0, -5)] ?? "Scenario"} failed`;
  return event.replaceAll("-", " ");
};
const themeButton = document.querySelector(".theme-toggle");
const themeCheck = document.querySelector(".theme-check");
const perspectiveButtons = document.querySelectorAll("[data-perspective]");
const headerActions = document.querySelector(".header-actions");
const aboutButton = document.createElement("button");
aboutButton.className = "about-toggle";
aboutButton.type = "button";
aboutButton.dataset.view = "about";
aboutButton.setAttribute("aria-label", "About this lab");
aboutButton.textContent = "ⓘ";
headerActions.insertBefore(aboutButton, themeButton);
const aboutView = document.createElement("div");
aboutView.className = "view";
aboutView.dataset.panel = "about";
aboutView.innerHTML = `<section class="about-hero about-project"><div><p class="kicker">ABOUT THIS PROJECT</p><h1>Understanding <em>BEC</em><br />in an AI-enabled world.</h1><div class="about-project-copy"><p>This website is a project by Shamym Iftikhar, Ruwail Fatima and Romaisa Fatima for their 5th semester's "Cyber Law, Crime and Warfare" project.</p><p>This interactive simulation introduces Business Email Compromise (BEC) and shows how AI can make phishing, impersonation, and reconnaissance more convincing. It presents both Red Team (offensive) and Blue Team (defensive) perspectives so users can study how attacks develop and how defenders interrupt them.</p><p>Users can explore fictional scenarios, identify threat signals, review safe browser-session telemetry, and practice verification, containment, and reporting decisions.</p><p>All activities use synthetic content in a controlled environment. No real messages are sent, no real targets are contacted, and no delivery workflow is provided.</p><p>Github of Shamym Iftikhar: <a href="https://github.com/sakura0503" target="_blank" rel="noreferrer">github.com/sakura0503</a></p></div></div><div class="about-mark">◈<small>SAFE<br />LAB</small></div></section>`;
document.querySelector(".content").append(aboutView);
const getPerspective = () => localStorage.getItem("bec-perspective") === "blue" ? "blue" : "red";
const sidebar = document.querySelector(".sidebar");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const menuToggle = document.querySelector(".menu-toggle");
const applyTheme = (theme) => {
  const light = theme === "light";
  document.documentElement.classList.toggle("light", light);
  if (themeButton) {
    themeButton.textContent = light ? "☾" : "☼";
    themeButton.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    themeButton.setAttribute("aria-pressed", String(light));
  }
  if (themeCheck) themeCheck.checked = !light;
};
applyTheme(localStorage.getItem("red-team-theme") ?? "dark");
const toast = (message) => {
  const element = document.querySelector(".toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => element.classList.remove("show"), 2800);
};
const perspectiveCopy = {
  red: {
    label: "Red Team perspective",
    brand: "RED TEAM <b>LAB</b>",
    mobile: "RT / LAB",
    title: "Study the attack.<br /><em>Strengthen the signal.</em>",
    copy: "A controlled lab for understanding how generative AI changes phishing, impersonation, and reconnaissance — without touching real targets.",
    stamp: "RED TEAM<br />PERSPECTIVE",
    kicker: "CHOOSE A VECTOR",
    vectorTitle: "Start a safe simulation",
    scenarioTitle: "Choose an attack vector to study",
    scenarioCopy: "Open a contained exercise and inspect the attacker technique, AI misuse, and defender interruption points.",
    signalsTitle: "Signals worth investigating",
    signalsCopy: "Patterns are presented as defensive indicators, not operational instructions.",
    signals: [
      ["Unusual urgency + account change", "Synthetic phishing", "94%", "REVIEW", "high"],
      ["Caller avoids known callback route", "Voice clone", "88%", "ESCALATE", "critical"],
      ["Role data clustered by model", "Automated recon", "76%", "MONITOR", "medium"]
    ],
    summary: [
      ["09", "Active indicators", "Across three AI vectors", "cyan"],
      ["03", "High-priority cues", "Pressure, identity, access", "red"],
      ["01", "Safe next move", "Pause before proceeding", "green"]
    ],
    guidance: ["Map the signal", "Ask what changed, who benefits, and which trusted process can verify the request.", "Begin with evidence, not assumptions."],
    playbook: {
      title: "Map the attack chain",
      copy: "Study how a fictional AI-assisted BEC scenario develops, then mark the point where a defender can interrupt it.",
      cards: [
        ["01", "Observe the pressure", "Identify urgency, secrecy, and authority cues without producing a real message or contacting a target."],
        ["02", "Trace the AI lift", "Mark where synthetic context, impersonation, or public signals make the fictional scenario more convincing."],
        ["03", "Record the stop point", "Document the safest interruption and the evidence a defender would need to act." ]
      ],
      sections: {
        checklist: ["Keep the scenario fictional", "Mark each persuasion cue", "Name the defender interruption"],
        evidence: ["Pressure or secrecy language", "Synthetic identity markers", "The moment verification was possible"],
        mistakes: ["Treating realism as proof", "Skipping containment", "Recording target-like details"],
        flow: ["Observe", "Label", "Interrupt", "Debrief"]
      }
    }
  },
  blue: {
    label: "Blue Team perspective",
    brand: "BLUE TEAM <b>LAB</b>",
    mobile: "BT / LAB",
    title: "Detect the threat.<br /><em>Protect the signal.</em>",
    copy: "A defensive training lab for identifying AI-assisted phishing, impersonation, and reconnaissance before they become incidents.",
    stamp: "BLUE TEAM<br />PERSPECTIVE",
    kicker: "CHOOSE A CONTROL",
    vectorTitle: "Test a defensive response",
    scenarioTitle: "Choose a defensive exercise",
    scenarioCopy: "Open a contained exercise and practice detecting, verifying, containing, and reporting the AI-assisted threat.",
    signalsTitle: "Investigate the warning signs",
    signalsCopy: "Use the evidence to detect, verify, contain, and report AI-driven BEC patterns.",
    signals: [
      ["Sender domain differs from vendor record", "Synthetic phishing", "97%", "VERIFY", "high"],
      ["Callback request breaks trusted process", "Voice clone", "91%", "CONTAIN", "critical"],
      ["Public role data over-collected", "Automated recon", "83%", "REPORT", "medium"]
    ],
    summary: [
      ["03", "Controls to test", "Verify, contain, report", "cyan"],
      ["97%", "Top confidence", "Vendor identity mismatch", "red"],
      ["100%", "Safe posture", "No action without proof", "green"]
    ],
    guidance: ["Defender checkpoint", "Use an independent directory, preserve the evidence, and hold the request until verified.", "Every signal should end in a documented control."],
    playbook: {
      title: "Interrupt the attack chain",
      copy: "Three controls that work across synthetic phishing, voice cloning, and automated discovery.",
      cards: [
        ["01", "Pause the pressure", "Urgency, secrecy, and unusual requests are signals to stop the workflow — not reasons to speed up."],
        ["02", "Verify independently", "Use a trusted directory, known number, or established process outside the suspicious message."],
        ["03", "Report the pattern", "Preserve the fictional evidence and share it with defenders so the next attempt is easier to catch."]
      ],
      sections: {
        checklist: ["Pause before replying or paying", "Use a trusted channel", "Report and preserve evidence"],
        evidence: ["Sender and domain details", "Unusual request or timing", "Verification and escalation record"],
        mistakes: ["Relying on the message thread", "Ignoring time pressure", "Deleting useful evidence"],
        flow: ["Pause", "Verify", "Contain", "Report"]
      }
    }
  }
};
const renderPlaybook = (playbook) => {
  const view = document.querySelector('[data-panel="playbook"]');
  view.querySelector(".page-title h1").textContent = playbook.title;
  view.querySelector(".page-title>p:last-child").textContent = playbook.copy;
  view.querySelector(".playbook-grid").innerHTML = playbook.cards.map(([number, title, copy]) => `<article><span>${number}</span><h3>${title}</h3><p>${copy}</p></article>`).join("");
  let tools = view.querySelector(".playbook-tools");
  if (!tools) {
    tools = document.createElement("div");
    tools.className = "playbook-tools";
    view.querySelector(".playbook-grid").after(tools);
  }
  const sectionLabels = { checklist: "Quick checklist", evidence: "Evidence to collect", mistakes: "Common mistakes", flow: "Response flow" };
  tools.innerHTML = Object.entries(playbook.sections).map(([key, items]) => `<article class="playbook-tool ${key}"><h3>${sectionLabels[key]}</h3><ul>${items.map((item, index) => `<li>${key === "flow" ? `<b>${String(index + 1).padStart(2, "0")}</b>` : "✓"} ${item}</li>`).join("")}</ul></article>`).join("");
};
const renderSignalExtras = (copy) => {
  const table = document.querySelector(".signal-table");
  let overview = document.querySelector("#signal-overview");
  if (!overview) {
    overview = document.createElement("div");
    overview.id = "signal-overview";
    table.parentElement.insertBefore(overview, table);
  }
  overview.innerHTML = copy.summary.map(([value, label, detail, tone]) => `<article class="signal-summary ${tone}"><strong>${value}</strong><b>${label}</b><small>${detail}</small></article>`).join("");
  let guidance = document.querySelector("#signal-guidance");
  if (!guidance) {
    guidance = document.createElement("aside");
    guidance.id = "signal-guidance";
    table.parentElement.append(guidance);
  }
  guidance.innerHTML = `<span class="guidance-icon">✦</span><div><b>${copy.guidance[0]}</b><p>${copy.guidance[1]}</p><small>${copy.guidance[2]}</small></div>`;
};
const renderSignals = (signals) => {
  const table = document.querySelector(".signal-table");
  table.innerHTML = `<div class="table-head"><span>SIGNAL</span><span>VECTOR</span><span>CONFIDENCE</span><span>STATUS</span></div>${signals.map(([signal, vector, confidence, status, severity]) => `<div><b>${signal}</b><span>${vector}</span><strong>${confidence}</strong><em class="severity ${severity}">${status}</em></div>`).join("")}`;
};
const applyPerspective = (perspective) => {
  const selected = perspective === "blue" ? "blue" : "red";
  const copy = perspectiveCopy[selected];
  document.documentElement.classList.toggle("blue-team", selected === "blue");
  document.querySelector("#perspective-label").textContent = copy.label;
  document.querySelector("#brand-label").innerHTML = copy.brand;
  document.querySelector("#mobile-brand").textContent = copy.mobile;
  document.querySelector("#hero-title").innerHTML = copy.title;
  document.querySelector("#hero-copy").textContent = copy.copy;
  document.querySelector("#hero-stamp").innerHTML = copy.stamp;
  document.querySelector("#vector-kicker").textContent = copy.kicker;
  document.querySelector("#vector-title").textContent = copy.vectorTitle;
  document.querySelector("#scenario-title").textContent = copy.scenarioTitle;
  document.querySelector("#scenario-copy").textContent = copy.scenarioCopy;
  document.querySelector("#signals-title").textContent = copy.signalsTitle;
  document.querySelector("#signals-copy").textContent = copy.signalsCopy;
  renderPlaybook(copy.playbook);
  renderSignalExtras(copy);
  renderSignals(copy.signals);
  perspectiveButtons.forEach((button) => {
    const active = button.dataset.perspective === selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  localStorage.setItem("bec-perspective", selected);
};
applyPerspective(localStorage.getItem("bec-perspective") ?? "red");
perspectiveButtons.forEach((button) => button.addEventListener("click", () => {
  applyPerspective(button.dataset.perspective);
  showView("overview");
}));
const modal = document.querySelector(".modal-backdrop");
const openModal = (title, copy, content, kicker = "SAFE SIMULATION") => {
  document.querySelector("#modal-kicker").textContent = kicker;
  document.querySelector("#modal-title").textContent = title;
  document.querySelector("#modal-copy").textContent = copy;
  document.querySelector("#modal-content").innerHTML = content;
  modal.classList.toggle("simulation-modal", content.includes("simulation-layout") || content.includes("email-simulation"));
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};
const closeModal = () => { modal.classList.remove("open", "simulation-modal"); modal.setAttribute("aria-hidden", "true"); };
const validViews = new Set(["overview", "scenarios", "signals", "telemetry", "playbook", "settings", "simulation", "about"]);
const showView = (name, updateUrl = true) => {
  if (!validViews.has(name)) name = "overview";
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("view-active", view.dataset.panel === name));
  document.querySelectorAll("[data-view]").forEach((link) => link.classList.toggle("active", link.dataset.view === name));
  if (updateUrl) {
    const nextUrl = name === "overview" ? `${window.location.pathname}${window.location.search}` : `${window.location.pathname}${window.location.search}#${name}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
      window.history.pushState({ view: name }, "", nextUrl);
    }
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "telemetry") renderTelemetry();
};
const viewFromUrl = () => {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith("simulation/")) {
    const [scenario, rawVariantIndex] = hash.slice("simulation/".length).split("/");
    if (scenarioIds.includes(scenario)) {
      const variantIndex = rawVariantIndex === "1" ? 1 : 0;
      state.scenario = scenario;
      state.variantIndex = variantIndex;
      showView("simulation", false);
      renderSimulationPage(scenario, undefined, undefined, undefined, undefined, variantIndex);
      if (!state.runId) void startScenario(scenario, variantIndex);
      return;
    }
  }
  showView(validViews.has(hash) ? hash : "overview", false);
};
const closeDrawer = () => {
  sidebar?.classList.remove("drawer-open");
  drawerBackdrop?.classList.remove("drawer-visible");
  drawerBackdrop?.setAttribute("aria-hidden", "true");
  menuToggle?.setAttribute("aria-expanded", "false");
};
const toggleDrawer = () => {
  const isOpen = sidebar?.classList.toggle("drawer-open") ?? false;
  drawerBackdrop?.classList.toggle("drawer-visible", isOpen);
  drawerBackdrop?.setAttribute("aria-hidden", String(!isOpen));
  menuToggle?.setAttribute("aria-expanded", String(isOpen));
};
const recordEvent = async (event) => {
  if (!state.runId) return;
  const telemetry = getTelemetry();
  telemetry.push({ runId: state.runId, scenario: state.scenario, event, label: formatEvent(event), at: new Date().toISOString() });
  saveTelemetry(telemetry);
  renderTelemetry();
  await fetch(`/api/runs/${state.runId}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }) });
};
const renderTelemetry = () => {
  const events = getTelemetry();
  const list = document.querySelector("#telemetry-list");
  const summary = document.querySelector("#telemetry-summary");
  if (!list || !summary) return;
  const runs = new Set(events.map((item) => item.runId)).size;
  const passed = events.filter((item) => item.event.endsWith("-success") || item.event === "triage-success").length;
  summary.innerHTML = `<div><small>RUNS THIS SESSION</small><strong>${runs}</strong></div><div><small>EVENTS RECORDED</small><strong>${events.length}</strong></div><div><small>SAFE OUTCOMES</small><strong>${passed}</strong></div><span>Stored in this tab only</span>`;
  if (!events.length) {
    list.innerHTML = `<div class="empty-state"><span>⌁</span><h2>No runs yet</h2><p>Open a scenario from the library to start recording safe, local telemetry.</p><button class="primary-btn" data-view-target="scenarios">Open scenario library</button></div>`;
    list.querySelector("[data-view-target]")?.addEventListener("click", () => showView("scenarios"));
    return;
  }
  list.innerHTML = events.slice().reverse().map((item) => `<div class="telemetry-row"><span class="telemetry-status ${item.event.endsWith("-success") || item.event === "triage-success" ? "passed" : item.event.endsWith("-fail") || item.event === "triage-fail" ? "failed" : "neutral"}">${item.event.endsWith("-success") || item.event === "triage-success" ? "✓" : item.event.endsWith("-fail") || item.event === "triage-fail" ? "!" : "·"}</span><div><b>${item.label}</b><small>${scenarioLabels[item.scenario] ?? "Simulation"} · ${new Date(item.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div><time>${new Date(item.at).toLocaleDateString([], { month: "short", day: "numeric" })}</time></div>`).join("");
};
function renderSimulationPage(scenario, title, kicker, copy, content, variantIndex = state.variantIndex) {
  if (!title) {
    if (scenario === "email-triage") {
      openEmailTriage(variantIndex);
    } else {
      openVectorExercise(scenario, variantIndex);
    }
    return;
  }
  const page = document.querySelector("#simulation-page");
  page.innerHTML = `<div class="simulation-page-head"><div><p class="kicker">${escapeHtml(kicker)}</p><h1>${escapeHtml(title)}</h1><p>${escapeHtml(copy)}</p></div><button class="text-btn simulation-exit" type="button">← Exit simulation</button></div><div id="simulation-content">${content}</div><div class="simulation-safety">✓ Fictional data · No messages sent · No real systems contacted</div>`;
  page.querySelector(".simulation-exit").addEventListener("click", () => showView("scenarios"));
}
const openSimulationPage = (scenario, variantIndex) => {
  const hash = `#simulation/${scenario}/${variantIndex}`;
  const nextUrl = `${window.location.pathname}${window.location.search}${hash}`;
  if (window.location.hash !== hash) window.history.pushState({ simulation: scenario, variantIndex }, "", nextUrl);
  showView("simulation", false);
  renderSimulationPage(scenario, undefined, undefined, undefined, undefined, variantIndex);
};
const startScenario = async (scenario, variantIndex = chooseVariantIndex(scenario)) => {
  const requestId = ++state.generationRequestId;
  const perspective = getPerspective();
  state.scenario = scenario;
  state.variantIndex = variantIndex;
  state.runId = null;
  state.generatedScenario = null;
  state.scenarioInteracted = false;
  openSimulationPage(scenario, variantIndex);
  void generateScenarioVariant(scenario, perspective, variantIndex, requestId);
  try {
    const response = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario }) });
    if (!response.ok) throw new Error("Could not start the safe simulation.");
    const result = await response.json();
    if (requestId !== state.generationRequestId) return;
    state.runId = result.run.id;
    await recordEvent("scenario-opened");
  } catch (error) {
    toast(error.message);
  }
};
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
  "'": "&#39;"
}[character]));
const renderEmailClient = ({ sender, recipient, subject, body, time = "Today, 10:42 AM" }) => {
  const senderMatch = sender.match(/^(.*?)\s*<([^>]+)>$/);
  const senderName = senderMatch ? senderMatch[1] : sender;
  const senderAddress = senderMatch ? senderMatch[2] : "";
  const initials = senderName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "??";
  const paragraphs = String(body).split(/\n+/).filter(Boolean).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  return `<div class="mail-client"><aside class="mail-folders" aria-label="Mailbox folders"><div class="mail-app-name"><span>✉</span> Maildesk</div><div class="mail-safe-label">SIMULATION ONLY</div><div class="mail-folder active"><span>▣ Inbox</span><b>1</b></div><div class="mail-folder"><span>☆ Starred</span></div><div class="mail-folder"><span>◷ Snoozed</span></div><div class="mail-folder"><span>↗ Sent</span></div><div class="mail-folder"><span>▤ Drafts</span></div></aside><section class="mail-main" aria-label="Fictional email"><div class="mail-list-bar"><b>Inbox</b><span>1 message · Training sample</span></div><div class="mail-toolbar"><span>‹</span><span>Archive</span><span>Report</span><span>Delete</span><i></i><span>⋯</span></div><article class="mail-message"><div class="mail-subject-line"><h2>${escapeHtml(subject)}</h2><span>SIMULATED</span></div><div class="mail-sender-row"><span class="mail-avatar">${escapeHtml(initials)}</span><div class="mail-sender-meta"><b>${escapeHtml(senderName)}</b><span>${senderAddress ? `&lt;${escapeHtml(senderAddress)}&gt;` : "Fictional sender"}</span><small>to ${escapeHtml(recipient)}</small></div><time>${escapeHtml(time)}</time></div><div class="mail-message-body">${paragraphs}</div><div class="mail-inline-actions"><span>↩ Reply</span><span>↪ Forward</span><small>Actions are disabled in this exercise</small></div></article></section></div>`;
};
const generateScenarioVariant = async (scenario, perspective, variantIndex, requestId) => {
  try {
    const response = await fetch("/api/scenarios/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario, perspective })
    });
    let result = {};
    try {
      result = await response.json();
    } catch {
      // Keep the saved training sample available if the endpoint returns a non-JSON error.
    }
    if (!response.ok) throw new Error(result?.error || "AI scenario generation failed.");
    const generated = result?.scenario;
    const needsEmail = scenario !== "voice-clone" && scenario !== "automated-recon";
    if (!generated || typeof generated.title !== "string" || typeof generated.evidence !== "string" ||
        !Array.isArray(generated.clues) || generated.clues.length !== 3 ||
        (needsEmail
          ? !Array.isArray(generated.email) || generated.email.length !== 4 || !generated.email.every((part) => typeof part === "string")
          : generated.email !== undefined) ||
        requestId !== state.generationRequestId ||
        state.scenario !== scenario || getPerspective() !== perspective ||
        state.scenarioInteracted) return;
    state.generatedScenario = generated;
    renderSimulationPage(scenario, undefined, undefined, undefined, undefined, variantIndex);
    toast("Fresh fictional scenario generated with OpenRouter.");
  } catch (error) {
    if (requestId === state.generationRequestId && state.scenario === scenario &&
        getPerspective() === perspective && !state.scenarioInteracted) {
      const message = error instanceof Error ? error.message : "Unknown generation error.";
      toast(`AI generation unavailable: ${message} Showing the saved scenario instead.`);
    }
  }
};
const vectorExercises = {
  "synthetic-phish": {
    type: "email",
    red: [
      { title: "Invoice pressure review", kicker: "RED TEAM · CONTAINED MESSAGE LAB", evidence: "Review a synthetic invoice-change message and label the pressure and identity cues. The sample is non-deliverable.", clues: ["Urgency changes decision quality", "Sender identity needs independent validation", "Keep all sample content isolated"], actions: [["label", "Identify the risk cues"], ["verify", "Map the verification point"], ["contain", "Keep the sample isolated"]], correct: "contain", email: ["Fictional supplier <billing@vendor.example.test>", "finance@example.test", "Invoice review request", "A fictional invoice request asks for a quick review. No payment details or real links are included."] },
      { title: "Supplier impersonation tabletop", kicker: "RED TEAM · SYNTHETIC SCENARIO", evidence: "Examine a made-up supplier notification as a tabletop exercise; focus on the control that would stop an unsafe action.", clues: ["A familiar display name is not proof", "Unexpected account changes need a second channel", "Do not turn the sample into a sendable lure"], actions: [["label", "Identify the risk cues"], ["verify", "Map the verification point"], ["contain", "Keep the sample isolated"]], correct: "contain", email: ["Sample contact <notice@supplier.example.test>", "ap@example.test", "Account detail notice", "This fictional notice references an account update. Treat it as untrusted until checked through an established process."] }
    ],
    blue: [
      { title: "Synthetic phishing", kicker: "BLUE TEAM · MESSAGE REVIEW", evidence: "A fictional supplier email requests an invoice review and creates time pressure.", clues: ["Unexpected urgency", "Sender identity requires confirmation", "Payment changes need independent verification"], actions: [["reply", "Reply in the message thread"], ["verify", "Confirm with a known supplier contact"], ["process", "Process the change now"]], correct: "verify", email: ["Fictional supplier <billing@vendor.example.test>", "finance@example.test", "Invoice review before close", "Please review this fictional invoice change today. The message has not been verified and should not be acted on yet."] },
      { title: "Supplier message verification", kicker: "BLUE TEAM · INBOX EXERCISE", evidence: "A synthetic supplier note asks staff to review a revised invoice outside the usual schedule.", clues: ["Unexpected timing", "Changed payment context", "No independent confirmation"], actions: [["reply", "Reply to the sender"], ["verify", "Use the supplier contact already on file"], ["process", "Accept the update as valid"]], correct: "verify", email: ["Sample accounts contact <accounts@supplier.example.test>", "ap@example.test", "Revised invoice details", "This fictional message references revised invoice details. Verify the request independently before making any account changes."] }
    ]
  },
  "voice-clone": {
    type: "call",
    red: [
      { title: "Synthetic caller risk review", kicker: "RED TEAM · VOICE SAFETY TABLETOP", evidence: "Discuss a fictional caller claiming to be an executive. No voice is generated, recorded, or transmitted.", clues: ["Familiarity can be simulated", "A request to bypass process is a warning", "Use a known callback route"], actions: [["label", "Label the impersonation warning signs"], ["verify", "Document the independent check"], ["contain", "Keep the exercise fictional and contained"]], correct: "contain" },
      { title: "Callback-control rehearsal", kicker: "RED TEAM · IDENTITY EXERCISE", evidence: "A tabletop caller asks for a sensitive action while claiming to be unavailable for the normal callback. Identify the safe control.", clues: ["Caller ID is not authentication", "Urgency should not bypass approval", "No real person or transfer is involved"], actions: [["label", "Record the pressure cues"], ["verify", "Map the trusted callback control"], ["contain", "Keep the scenario non-operational"]], correct: "contain" }
    ],
    blue: [
      { title: "Voice clone callback", kicker: "BLUE TEAM · CALL VERIFICATION", evidence: "A fictional executive caller asks for a sensitive action and discourages the usual callback.", clues: ["Unrecognized number", "Request to skip a control", "Pressure to act quickly"], actions: [["trust", "Rely on the familiar-sounding voice"], ["verify", "End the call and use the company directory"], ["approve", "Approve while the caller waits"]], correct: "verify" },
      { title: "Unusual executive request", kicker: "BLUE TEAM · IDENTITY CHECK", evidence: "A simulated caller claims an urgent schedule conflict and requests an exception to the standard approval process.", clues: ["Urgency and authority are combined", "A process exception is requested", "Identity is not independently confirmed"], actions: [["continue", "Continue using the caller's instructions"], ["verify", "Call back using a trusted number"], ["approve", "Grant the requested exception"]], correct: "verify" }
    ]
  },
  "automated-recon": {
    type: "recon",
    red: [
      { title: "Synthetic exposure tabletop", kicker: "RED TEAM · FICTIONAL DATA LAB", evidence: "Review a wholly synthetic set of public-information categories and identify why aggregating them can raise privacy risk. No real people or systems are queried.", clues: ["Small public clues can combine", "Only synthetic records are used", "Focus on exposure reduction, not collection"], actions: [["label", "Map the privacy risks"], ["review", "Recommend reducing exposed details"], ["contain", "Keep the dataset synthetic"]], correct: "contain" },
      { title: "Discovery risk mapping", kicker: "RED TEAM · SAFE RESEARCH EXERCISE", evidence: "A fictional dashboard groups generic role and event categories. Discuss defensive exposure without collecting additional data.", clues: ["Aggregation can increase sensitivity", "Avoid real identities", "Document a safe interruption"], actions: [["label", "Mark the risk categories"], ["review", "Recommend a privacy review"], ["contain", "Keep all records fictional"]], correct: "contain" }
    ],
    blue: [
      { title: "Automated reconnaissance", kicker: "BLUE TEAM · EXPOSURE REVIEW", evidence: "A monitor flags an aggregation of fictional staff roles and public event references.", clues: ["Unnecessary detail is grouped", "Role information may reveal process context", "Review exposure and report safely"], actions: [["ignore", "Dismiss because each item was public"], ["report", "Review and report the aggregated exposure"], ["share", "Forward the profile broadly"]], correct: "report" },
      { title: "Public-information aggregation alert", kicker: "BLUE TEAM · PRIVACY RESPONSE", evidence: "A simulated alert shows generic public-post categories combined into one organisation profile.", clues: ["Aggregation changes the risk", "No real identities are included", "Escalate through the privacy process"], actions: [["dismiss", "Close the alert without review"], ["review", "Assess the exposure and notify the right team"], ["publish", "Share the profile with a wider audience"]], correct: "review" }
    ]
  },
  "vendor-change": {
    type: "email",
    red: [
      { title: "Vendor-change control rehearsal", kicker: "RED TEAM · PAYMENT SAFETY TABLETOP", evidence: "Use a fictional supplier-change request to identify where dual approval and independent verification should stop an unsafe update.", clues: ["The sample cannot update a real record", "A second channel is the key control", "Keep the exercise non-deliverable"], actions: [["label", "Identify the control gaps"], ["verify", "Map independent confirmation"], ["contain", "Keep the sample isolated"]], correct: "contain", email: ["Fictional vendor <records@vendor.example.test>", "ap@example.test", "Supplier record review", "This synthetic notice describes a supplier record change for discussion only. Do not update records based on the sample."] },
      { title: "Supplier-record tabletop", kicker: "RED TEAM · FICTIONAL PROCESS REVIEW", evidence: "Examine a made-up request to change supplier details and map the approval checkpoint, without drafting a real request.", clues: ["Record changes can redirect funds", "Approval should be separated", "Use fictional details only"], actions: [["label", "List the safeguards"], ["verify", "Identify the trusted verification route"], ["contain", "Keep the exercise offline and synthetic"]], correct: "contain", email: ["Sample vendor desk <change@vendor.example.test>", "finance@example.test", "Supplier details exercise", "This is a fictional supplier-record exercise. No account data is provided and no update should be made."] }
    ],
    blue: [
      { title: "Vendor change request", kicker: "BLUE TEAM · SUPPLIER VERIFICATION", evidence: "A fictional vendor message asks for a change to stored supplier details.", clues: ["Unverified account change", "Request arrived outside the usual process", "Existing contact details are available for a callback"], actions: [["accept", "Update the record from the message"], ["verify", "Confirm using the contact already on file"], ["reply", "Ask the sender to confirm in the same thread"]], correct: "verify", email: ["Fictional vendor <records@vendor.example.test>", "ap@example.test", "Supplier record review", "This synthetic notice asks for a supplier record update. Confirm through the established contact and approval process."] },
      { title: "Supplier detail verification", kicker: "BLUE TEAM · CHANGE CONTROL", evidence: "A simulated request asks staff to revise a supplier profile before the next payment run.", clues: ["Timing adds pressure", "The request changes a trusted record", "Require independent confirmation and dual approval"], actions: [["update", "Make the requested change"], ["verify", "Pause and confirm through a trusted channel"], ["forward", "Forward the request without review"]], correct: "verify", email: ["Fictional supplier contact <profile@supplier.example.test>", "payables@example.test", "Profile update needed", "A fictional supplier-profile update is pending. Do not change the record until independently confirmed."] }
    ]
  },
  "payroll-change": {
    type: "email",
    red: [
      { title: "Payroll control tabletop", kicker: "RED TEAM · FICTIONAL HR EXERCISE", evidence: "Review a synthetic payroll-change case and identify the control that protects employee records. No employee data or change workflow is present.", clues: ["Payroll data is sensitive", "A second approver can interrupt misuse", "Keep all identities fictional"], actions: [["label", "Map the approval controls"], ["verify", "Name a safe identity check"], ["contain", "Keep the case synthetic"]], correct: "contain", email: ["Fictional HR desk <hr@example.test>", "payroll@example.test", "Payroll process tabletop", "This fictional exercise describes a payroll-change review. It contains no employee or banking details."] },
      { title: "Employee-record safety review", kicker: "RED TEAM · PROCESS TABLETOP", evidence: "Discuss a made-up request to alter an employee record and document the checks that prevent unauthorized changes.", clues: ["Sensitive changes need strong verification", "Do not use real staff details", "Separate request and approval roles"], actions: [["label", "Identify the safeguards"], ["verify", "Map a trusted verification step"], ["contain", "Keep the exercise fictional"]], correct: "contain", email: ["Synthetic people operations <people@example.test>", "payroll@example.test", "Record review exercise", "This is a non-operational tabletop prompt with no personal or payment information."] }
    ],
    blue: [
      { title: "Payroll change review", kicker: "BLUE TEAM · EMPLOYEE-RECORD CHECK", evidence: "A fictional request asks to change payroll information shortly before a processing date.", clues: ["Sensitive record change", "Short notice", "Identity and approval must be checked independently"], actions: [["change", "Apply the change immediately"], ["verify", "Pause and use the established verification process"], ["reply", "Request confirmation in the same email thread"]], correct: "verify", email: ["Fictional HR contact <hr@example.test>", "payroll@example.test", "Payroll record review", "A synthetic request asks for a payroll record change. Verify identity and approval through established channels."] },
      { title: "Employee detail change alert", kicker: "BLUE TEAM · PAYROLL SAFEGUARD", evidence: "The simulated payroll queue flags an employee-detail update submitted outside the usual review window.", clues: ["Unexpected timing", "Sensitive employee record", "Use dual approval and notify the security team if suspicious"], actions: [["approve", "Approve the pending change"], ["hold", "Hold and verify through the HR process"], ["ignore", "Dismiss the alert as routine"]], correct: "hold", email: ["Synthetic HR operations <updates@example.test>", "payroll@example.test", "Pending employee detail change", "This fictional queue notice requires independent identity checks and documented approval before any change."] }
    ]
  }
};
const openVectorExercise = (scenario, variantIndex = state.variantIndex) => {
  const perspective = getPerspective();
  const scenarioData = vectorExercises[scenario];
  const variants = scenarioData?.[perspective];
  if (!variants) {
    toast("This scenario is unavailable.");
    return;
  }
  const exercise = { ...variants[variantIndex % variants.length], ...state.generatedScenario, type: scenarioData.type };
  const actionButtons = `<div class="simulation-actions"><b>Choose an action</b><div class="response-grid">${exercise.actions.map(([value, label]) => `<button data-vector-choice="${value}">${label}</button>`).join("")}</div></div>`;
  const cluePanel = `<aside class="signal-sidebar"><b>Analyst notes</b>${exercise.clues.map((clue) => `<span>${escapeHtml(clue)}</span>`).join("")}</aside>`;
  const sourceLabel = state.generatedScenario ? "OPENROUTER FREE MODEL" : "SAVED TRAINING SAMPLE";
  let simulation;
  if (exercise.email) {
    const [sender, recipient, subject, body] = exercise.email;
    simulation = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>MAILBOX / INBOX</span><span>${sourceLabel} · NOT SENT</span></div>${renderEmailClient({ sender, recipient, subject, body })}${actionButtons}</div>${cluePanel}</div>`;
  } else if (exercise.type === "call") {
    const markers = exercise.clues.map((clue) => `<b>${escapeHtml(clue)}</b>`).join("");
    const waveform = Array.from({ length: 19 }, () => "<i></i>").join("");
    simulation = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>CALL REVIEW / SIMULATED INBOUND</span><span>${sourceLabel} · NOT CONNECTED</span></div><article class="call-console"><div class="caller-avatar">FC</div><div class="caller-identity"><b>Fictional caller</b><small>Claimed identity · Not independently verified</small></div><span class="call-status simulation-status">● SIMULATION</span><div class="call-controls"><span class="call-play" aria-hidden="true">▶</span><div class="call-waveform" aria-hidden="true">${waveform}</div><span class="call-duration">00:00 · AUDIO DISABLED</span></div><blockquote>${escapeHtml(exercise.evidence)}</blockquote><div class="call-transcript"><span>REVIEW MARKERS</span>${markers}</div></article>${actionButtons}</div>${cluePanel}</div>`;
  } else {
    const signalCards = exercise.clues.map((clue, index) => `<div><b>SYNTHETIC CUE 0${index + 1}</b><span>${escapeHtml(clue)}</span></div>`).join("");
    simulation = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>EXPOSURE MONITOR / FICTIONAL DATA</span><span>${sourceLabel} · NO LIVE SOURCES</span></div><article class="recon-console"><div class="recon-score"><strong>03</strong><small>SAFE CUES</small></div><div><b>${escapeHtml(exercise.title)}</b><small>Synthetic signals · no real identities</small><p>${escapeHtml(exercise.evidence)}</p></div></article><div class="evidence-grid">${signalCards}</div>${actionButtons}</div>${cluePanel}</div>`;
  }
  const simulationCopy = perspective === "red"
    ? "Study the fictional risk and safe containment controls. No message, call, or dataset can reach a real target."
    : "Work through this fictional exercise and choose the control you would apply. No external action is performed.";
  renderSimulationPage(scenario, exercise.title, exercise.kicker, simulationCopy, simulation, variantIndex);
  document.querySelectorAll("[data-vector-choice]").forEach((button) => button.addEventListener("click", () => {
    state.scenarioInteracted = true;
    const success = button.dataset.vectorChoice === exercise.correct;
    recordEvent(`${scenario}-${success ? "success" : "fail"}`);
    document.querySelector("#simulation-content").innerHTML = `<div class="result ${success ? "success" : "fail"}"><strong>${success ? "CONTROL APPLIED · Threat interrupted" : "CONTROL MISSED · Threat remains active"}</strong><small>${success ? "You paused the workflow and selected a safe verification or investigation step." : "The safer move is to pause, use a trusted verification route, and report the pattern to defenders."}</small></div><div class="answer-review"><b>Analyst debrief</b><p>${exercise.clues.join(" · ")}. Familiar language and realistic context do not establish trust.</p><button class="primary-btn vector-done">Close simulation</button></div>`;
    document.querySelector(".vector-done").addEventListener("click", () => { showView("telemetry"); toast(success ? "Simulation passed · safe control recorded" : "Simulation failed · review the defender playbook"); });
  }));
};
const openEmailTriage = (variantIndex = state.variantIndex) => {
  const variants = [
    {
      redTitle: "Invoice pressure containment",
      redSubject: "Synthetic invoice review",
      redCopy: "This isolated tabletop sample highlights how an invoice-change request can create pressure. It has no recipient, real domain, or send action.",
      blueTitle: "Email triage",
      sender: "Morgan Lee <morgan.lee@vendor.example.test>",
      subject: "Invoice account review",
      body: "A fictional supplier message asks for an account update before the next payment run. Verify through a known contact before acting."
    },
    {
      redTitle: "Supplier identity tabletop",
      redSubject: "Fictional supplier notice",
      redCopy: "This contained exercise examines an unexpected supplier notice and the point where independent verification prevents an unsafe change.",
      blueTitle: "Supplier notice review",
      sender: "Taylor Reed <taylor.reed@supplier.example.test>",
      subject: "Supplier details need review",
      body: "A synthetic notice references revised supplier details. The request is unverified and should be held for a trusted-channel check."
    }
  ];
  const savedVariant = variants[variantIndex % variants.length];
  const generated = state.generatedScenario;
  const generatedEmail = generated?.email;
  const variant = generated ? {
    ...savedVariant,
    redTitle: generated.title,
    redSubject: generatedEmail?.[2] ?? savedVariant.redSubject,
    redCopy: generated.evidence,
    blueTitle: generated.title,
    sender: generatedEmail?.[0] ?? savedVariant.sender,
    subject: generatedEmail?.[2] ?? savedVariant.subject,
    body: generatedEmail?.[3] ?? savedVariant.body
  } : savedVariant;
  const sourceLabel = generated ? "OPENROUTER FREE MODEL" : "SAVED TRAINING SAMPLE";
  if (getPerspective() === "red") {
    const email = renderEmailClient({
      sender: generatedEmail?.[0] ?? "Synthetic training sample <training@example.test>",
      recipient: "No recipient · isolated",
      subject: variant.redSubject,
      body: `${variant.redCopy}\nNo real recipient, domain, or send action is available.`,
      time: "TABLETOP EXERCISE"
    });
    const analystNotes = (generated?.clues ?? ["Understand the defensive control points", "Keep all identities and content fictional", "Never produce or deliver a real lure"])
      .map((clue) => `<span>${escapeHtml(clue)}</span>`).join("");
    const content = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>MAILBOX / CONTAINED TABLETOP</span><span>${sourceLabel} · UNSENT</span></div>${email}<div class="simulation-actions"><b>Choose a safe learning action</b><div class="response-grid"><button data-red-triage="label">Label the risk cues</button><button data-red-triage="verify">Map the verification control</button><button data-red-triage="contain">Keep the sample isolated</button></div></div></div><aside class="signal-sidebar"><b>Red Team learning goals</b>${analystNotes}</aside></div>`;
    renderSimulationPage("email-triage", variant.redTitle, "RED TEAM · CONTAINED EMAIL LAB", "Study the mechanics of a fictional BEC scenario without creating a sendable message.", content, variantIndex);
    document.querySelectorAll("[data-red-triage]").forEach((button) => button.addEventListener("click", () => {
      state.scenarioInteracted = true;
      const safe = button.dataset.redTriage === "contain";
      recordEvent(`email-triage-${safe ? "success" : "fail"}`);
      document.querySelector("#simulation-content").innerHTML = `<div class="result ${safe ? "success" : "fail"}"><strong>${safe ? "LAB CONTAINED · Safe rehearsal selected" : "SAFETY CONTROL MISSED"}</strong><small>${safe ? "The fictional lure remains isolated and cannot be sent." : "Keep attacker-content rehearsals synthetic, non-deliverable, and isolated."}</small></div><div class="answer-review"><b>Red Team debrief</b><p>Understanding pressure patterns is useful only when the exercise cannot reach a real target.</p><button class="primary-btn vector-done">Close simulation</button></div>`;
      document.querySelector(".vector-done").addEventListener("click", () => { showView("telemetry"); });
    }));
    return;
  }
  const email = renderEmailClient({
    sender: variant.sender,
    recipient: generatedEmail?.[1] ?? "finance@example.test",
    subject: variant.subject,
    body: `Hello team,\n${variant.body}\nRegards,\nSynthetic supplier contact`
  });
  const analystNotes = (generated?.clues ?? ["Confirm identity independently", "Hold sensitive record changes", "Report suspicious requests"])
    .map((clue) => `<span>${escapeHtml(clue)}</span>`).join("");
  const content = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>MAILBOX / PAYMENT REVIEW</span><span>${sourceLabel} · NOT SENT</span></div>${email}<div class="triage-stage"><b>Review the message before acting</b><label><input type="checkbox" data-flag="domain" /> Sender identity or domain needs verification</label><label><input type="checkbox" data-flag="urgency" /> The request creates time pressure</label><label><input type="checkbox" data-flag="payment" /> It refers to a sensitive account change</label><label><input type="checkbox" data-flag="channel" /> It lacks independent confirmation</label><p class="triage-hint">Select the warning signs you would record in an incident report.</p><button class="primary-btn triage-next">Continue review</button></div></div><aside class="signal-sidebar"><b>Analyst notes</b>${analystNotes}</aside></div>`;
  renderSimulationPage("email-triage", variant.blueTitle, "EXERCISE 04 · INBOX DECISION", "Review the fictional message as an analyst. No reply, payment, or attachment is sent.", content, variantIndex);
  document.querySelectorAll("[data-flag]").forEach((input) => input.addEventListener("change", () => {
    state.scenarioInteracted = true;
  }));
  document.querySelector(".triage-next").addEventListener("click", () => {
    state.scenarioInteracted = true;
    const selected = [...document.querySelectorAll("[data-flag]:checked")].map((input) => input.dataset.flag);
    const expected = ["domain", "urgency", "payment", "channel"];
    const missed = expected.filter((flag) => !selected.includes(flag));
    recordEvent(`flags-${selected.length}`);
    const flagFeedback = missed.length === 0
      ? `<div class="result success"><strong>Red flags identified</strong><small>You found all four warning signs.</small></div>`
      : `<div class="result fail"><strong>${missed.length} warning sign${missed.length === 1 ? "" : "s"} missed</strong><small>Review the highlighted pressure and verification clues.</small></div>`;
    document.querySelector(".triage-stage").innerHTML = `${flagFeedback}<b>Choose your response</b><div class="response-grid"><button data-response="reply">Reply and ask for details</button><button data-response="pay">Process the update</button><button data-response="verify">Verify using a known number</button><button data-response="report">Report and hold the payment</button></div>`;
    document.querySelectorAll("[data-response]").forEach((button) => button.addEventListener("click", () => {
      state.scenarioInteracted = true;
      const correct = (button.dataset.response === "verify" || button.dataset.response === "report") && missed.length === 0;
      recordEvent(correct ? "triage-success" : "triage-fail");
      document.querySelector(".triage-stage").innerHTML = `<div class="result ${correct ? "success" : "fail"}"><strong>${correct ? "CONTROL APPLIED · Request contained" : "CONTROL MISSED · Request remains active"}</strong><small>${correct ? "You identified the red flags and stopped the request for independent verification." : "Do not reply, pay, or trust the message. Verify through a known channel and report it to security."}</small></div><div class="answer-review"><b>Analyst debrief</b><p>The lookalike domain, urgency, bank-detail change, and blocked callback route are common BEC indicators.</p><button class="primary-btn triage-done">Close simulation</button></div>`;
      document.querySelector(".triage-done").addEventListener("click", () => { showView("telemetry"); toast(correct ? "Simulation passed · safe response recorded" : "Simulation failed · review the defender playbook"); });
    }));
  });
};

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => {
  showView(button.dataset.view);
  closeDrawer();
}));
document.querySelectorAll("[data-view-target]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.viewTarget)));
window.addEventListener("popstate", viewFromUrl);
window.addEventListener("hashchange", viewFromUrl);
document.querySelectorAll("[data-scenario]").forEach((button) => button.addEventListener("click", () => startScenario(button.dataset.scenario)));
themeButton?.addEventListener("click", () => {
  const next = document.documentElement.classList.contains("light") ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("red-team-theme", next);
});
themeCheck?.addEventListener("change", () => {
  const next = themeCheck.checked ? "dark" : "light";
  applyTheme(next);
  localStorage.setItem("red-team-theme", next);
});
document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.action === "notifications") openModal("Session notifications", "Three safe-simulation updates are waiting.", `<div class="modal-card"><b>New signal mapped</b>Voice clone callback has a new verification marker.</div><div class="modal-card" style="margin-top:8px"><b>Guardrail check</b>All traffic remains local to the lab.</div>`, "INBOX");
  if (button.dataset.action === "guardrails") openModal("Safety model", "The lab is designed to explain misuse without enabling delivery.", `<div class="modal-card"><b>Fictional by default</b>Identities, messages, and target context are synthetic.</div><div class="modal-card" style="margin-top:8px"><b>Isolated by design</b>Runs are held in memory and the API records only short event labels.</div><div class="modal-card" style="margin-top:8px"><b>Defender-first output</b>Every vector ends with an interruption point and reporting action.</div>`, "LAB GUARDRAIL");
  if (button.dataset.action === "feed") toast("Feed is already filtered to this session");
}));
document.querySelector(".modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
menuToggle?.addEventListener("click", toggleDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);
window.addEventListener("resize", () => {
  if (window.innerWidth > 720) closeDrawer();
});
viewFromUrl();
renderTelemetry();
