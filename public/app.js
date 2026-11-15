const state = { runId: null, scenario: null, toastTimer: null };
const telemetryKey = "red-team-telemetry";
const scenarioLabels = {
  "synthetic-phish": "Synthetic phishing",
  "voice-clone": "Voice clone callback",
  "automated-recon": "Automated reconnaissance",
  "email-triage": "Email triage"
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
    const scenario = hash.slice("simulation/".length);
    if (["synthetic-phish", "voice-clone", "automated-recon", "email-triage"].includes(scenario)) {
      state.scenario = scenario;
      showView("simulation", false);
      renderSimulationPage(scenario);
      if (!state.runId) void startScenario(scenario);
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
function renderSimulationPage(scenario, title, kicker, copy, content) {
  if (!title) {
    if (scenario === "email-triage") {
      openEmailTriage();
    } else {
      openVectorExercise(scenario);
    }
    return;
  }
  const page = document.querySelector("#simulation-page");
  page.innerHTML = `<div class="simulation-page-head"><div><p class="kicker">${kicker}</p><h1>${title}</h1><p>${copy}</p></div><button class="text-btn simulation-exit" type="button">← Exit simulation</button></div><div id="simulation-content">${content}</div><div class="simulation-safety">✓ Fictional data · No messages sent · No real systems contacted</div>`;
  page.querySelector(".simulation-exit").addEventListener("click", () => showView("scenarios"));
}
const openSimulationPage = (scenario) => {
  const nextUrl = `${window.location.pathname}${window.location.search}#simulation/${scenario}`;
  if (window.location.hash !== `#simulation/${scenario}`) window.history.pushState({ simulation: scenario }, "", nextUrl);
  showView("simulation", false);
  renderSimulationPage(scenario);
};
const startScenario = async (scenario) => {
  state.scenario = scenario;
  openSimulationPage(scenario);
  try {
    const response = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario }) });
    if (!response.ok) throw new Error("Could not start the safe simulation.");
    const result = await response.json();
    state.runId = result.run.id;
    await recordEvent("scenario-opened");
  } catch (error) {
    toast(error.message);
  }
};
const openVectorExercise = (scenario) => {
  const exercises = {
    "synthetic-phish": {
      title: "Synthetic phishing",
      kicker: "VECTOR 01 · AI-GENERATED LURE",
      type: "email",
      sender: "Nadia Chen <nadia.chen@northstar-loglstics.co>",
      recipient: "accounts@acme-corp.com",
      subject: "Updated bank details — invoice 4817",
      time: "Today, 10:42",
      body: "Hi team,\\n\\nWe have updated our receiving account for invoice 4817. Please use the attached form before 16:00 so payment is not delayed. I am in back-to-back meetings, so please do not call.\\n\\nThanks,\\nNadia\\nAccounts Payable",
      clues: ["Lookalike sender domain", "Urgency before a deadline", "Payment details changed in the request"],
      actions: [["reply", "Reply to the sender"], ["verify", "Verify with a known supplier contact"], ["process", "Approve the bank-detail change"]],
      correct: "verify"
    },
    "voice-clone": {
      title: "Voice clone callback",
      kicker: "VECTOR 02 · SYNTHETIC IMPERSONATION",
      type: "call",
      evidence: "A fictional executive calls from an unrecognized number asking for an urgent transfer. The voice sounds familiar, but the caller refuses the normal callback process.",
      clues: ["Unusual urgency", "Caller avoids the known callback route", "Request bypasses approval controls"],
      actions: [["trust", "Continue the call and trust the voice"], ["verify", "End the call and use the company directory"], ["approve", "Approve the transfer while they wait"]],
      correct: "verify"
    },
    "automated-recon": {
      title: "Automated reconnaissance",
      kicker: "VECTOR 03 · AI-ASSISTED DISCOVERY",
      type: "recon",
      evidence: "The monitoring console has grouped fictional public posts, staff roles, and technology references into a profile of your organisation.",
      clues: ["Public details are combined at scale", "Staff roles reveal likely approval paths", "Technology clues expose useful context"],
      actions: [["ignore", "Close the alert as harmless public data"], ["report", "Open an investigation and review exposed information"], ["share", "Forward the profile internally without review"]],
      correct: "report"
    }
  };
  const exercise = exercises[scenario];
  if (getPerspective() === "red") {
    const redExercises = {
      "synthetic-phish": {
        title: "Lure design rehearsal",
        kicker: "RED TEAM · CONTROLLED PHISHING LAB",
        evidence: "Use a fictional supplier identity to study which language patterns make an invoice lure feel convincing. This rehearsal never creates a sendable message.",
        clues: ["Personalisation increases credibility", "Deadlines create pressure", "Payment changes create the critical decision point"],
        actions: [["personalize", "Add fictional context to the draft"], ["pressure", "Add an urgent deadline"], ["contain", "Keep the lure in the isolated lab"]],
        correct: "contain"
      },
      "voice-clone": {
        title: "Impersonation rehearsal",
        kicker: "RED TEAM · SYNTHETIC VOICE LAB",
        evidence: "Review a fictional executive-call script and identify the social-engineering pressure being modelled. No voice is generated or transmitted.",
        clues: ["Authority is used to accelerate approval", "Familiarity can bypass skepticism", "A blocked callback is the interruption point"],
        actions: [["authority", "Increase executive authority in the script"], ["urgency", "Add a time-sensitive transfer request"], ["contain", "Keep the script as a non-deliverable sample"]],
        correct: "contain"
      },
      "automated-recon": {
        title: "Discovery-chain rehearsal",
        kicker: "RED TEAM · CONTROLLED RECON LAB",
        evidence: "Inspect how fictional public signals could be grouped into a target profile. The lab uses synthetic records and does not query real people or systems.",
        clues: ["Role data can reveal approval paths", "Separate public clues become stronger when grouped", "Synthetic records keep the exercise contained"],
        actions: [["cluster", "Group more fictional public signals"], ["prioritize", "Prioritize a fictional approval path"], ["contain", "Keep the dataset synthetic and isolated"]],
        correct: "contain"
      }
    };
    Object.assign(exercise, redExercises[scenario]);
  }
  const actionButtons = `<div class="simulation-actions"><b>Choose an action</b><div class="response-grid">${exercise.actions.map(([value, label]) => `<button data-vector-choice="${value}">${label}</button>`).join("")}</div></div>`;
  const cluePanel = `<aside class="signal-sidebar"><b>Analyst notes</b>${exercise.clues.map((clue) => `<span>• ${clue}</span>`).join("")}</aside>`;
  let simulation = "";
  if (exercise.type === "email") {
    simulation = `<div class="workstation"><div class="inbox-toolbar"><span>INBOX / EXTERNAL</span><span>${exercise.time}</span></div><article class="real-email"><div class="email-meta"><b>${exercise.sender}</b><small>To: ${exercise.recipient} · ${exercise.time}</small><strong>Subject: ${exercise.subject}</strong></div><div class="email-body">${exercise.body.split("\\n").map((line) => `<p>${line || "&nbsp;"}</p>`).join("")}<div class="email-attachment">▧ <b>Updated_payment_form.pdf</b><small>PDF · 84 KB</small></div></div></article>${actionButtons}</div>${cluePanel}`;
  } else if (exercise.type === "call") {
    simulation = `<div class="workstation"><div class="inbox-toolbar"><span>CALL REVIEW / INCOMING</span><span>10:17</span></div><article class="call-console"><div class="caller-avatar">EM</div><div><b>Unknown caller</b><small>+1 (555) 019-2048 · Claimed identity: Evan Mills, CFO</small></div><span class="call-status">● RECORDING</span><blockquote>“I need this transfer approved before the board meeting. Do not call my usual number — I’m between meetings.”</blockquote><div class="call-transcript"><span>TRANSCRIPT MARKERS</span><b>Urgency</b><b>Callback refusal</b><b>Approval bypass</b></div></article>${actionButtons}</div>${cluePanel}`;
  } else {
    simulation = `<div class="workstation"><div class="inbox-toolbar"><span>THREAT MONITOR / DISCOVERY CLUSTER</span><span>ALERT 0042</span></div><article class="recon-console"><div class="recon-score"><strong>76%</strong><small>CONTEXT RISK</small></div><div><b>Northstar profile cluster</b><small>12 public signals grouped by an automated model</small><p>Staff roles · conference posts · technology references · approval workflow</p></div></article><div class="evidence-grid"><div><b>PUBLIC POSTS</b><span>3 conference updates</span></div><div><b>ROLE DATA</b><span>5 staff profiles</span></div><div><b>TECH STACK</b><span>4 technology clues</span></div></div>${actionButtons}</div>${cluePanel}`;
  }
  const simulationCopy = getPerspective() === "red"
    ? "Study the fictional attack pattern inside an isolated lab. No message, call, or dataset can reach a real target."
    : "Work through this fictional workstation and choose the control you would apply. No external action is performed.";
  renderSimulationPage(scenario, exercise.title, exercise.kicker, simulationCopy, `${simulation}`);
  document.querySelectorAll("[data-vector-choice]").forEach((button) => button.addEventListener("click", () => {
    const success = button.dataset.vectorChoice === exercise.correct;
    recordEvent(`${scenario}-${success ? "success" : "fail"}`);
    document.querySelector("#simulation-content").innerHTML = `<div class="result ${success ? "success" : "fail"}"><strong>${success ? "CONTROL APPLIED · Threat interrupted" : "CONTROL MISSED · Threat remains active"}</strong><small>${success ? "You paused the workflow and selected a safe verification or investigation step." : "The safer move is to pause, use a trusted verification route, and report the pattern to defenders."}</small></div><div class="answer-review"><b>Analyst debrief</b><p>${exercise.clues.join(" · ")}. Familiar language, public information, and realistic context do not make a request trustworthy.</p><button class="primary-btn vector-done">Close simulation</button></div>`;
    document.querySelector(".vector-done").addEventListener("click", () => { showView("telemetry"); toast(success ? "Simulation passed · safe control recorded" : "Simulation failed · review the defender playbook"); });
  }));
};
const openEmailTriage = () => {
  if (getPerspective() === "red") {
    const content = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>RED TEAM LAB / LURE DRAFT</span><span>CONTAINED</span></div><article class="real-email"><div class="email-meta"><b>Fictional supplier draft</b><small>Destination: none · Delivery disabled</small><strong>Subject: Invoice update request</strong></div><div class="email-body"><p>This isolated draft demonstrates how an attacker might combine a supplier identity, a payment change, and a deadline.</p><p>No recipient, real domain, or send action is available in this exercise.</p></div></article><div class="simulation-actions"><b>Choose how to keep the rehearsal safe</b><div class="response-grid"><button data-red-triage="personalize">Add more fictional context</button><button data-red-triage="pressure">Add urgency language</button><button data-red-triage="contain">Keep the draft isolated</button></div></div></div><aside class="signal-sidebar"><b>Red Team learning goals</b><span>• Understand persuasion mechanics</span><span>• Identify where defenders can interrupt</span><span>• Never produce or deliver a real lure</span></aside></div>`;
    renderSimulationPage("email-triage", "Lure construction rehearsal", "RED TEAM · CONTAINED EMAIL LAB", "Study the mechanics of a fictional BEC lure without creating a sendable message.", content);
    document.querySelectorAll("[data-red-triage]").forEach((button) => button.addEventListener("click", () => {
      const safe = button.dataset.redTriage === "contain";
      recordEvent(`email-triage-${safe ? "success" : "fail"}`);
      document.querySelector("#simulation-content").innerHTML = `<div class="result ${safe ? "success" : "fail"}"><strong>${safe ? "LAB CONTAINED · Safe rehearsal selected" : "SAFETY CONTROL MISSED"}</strong><small>${safe ? "The fictional lure remains isolated and cannot be sent." : "Keep attacker-content rehearsals synthetic, non-deliverable, and isolated."}</small></div><div class="answer-review"><b>Red Team debrief</b><p>Understanding pressure patterns is useful only when the exercise cannot reach a real target.</p><button class="primary-btn vector-done">Close simulation</button></div>`;
      document.querySelector(".vector-done").addEventListener("click", () => { showView("telemetry"); });
    }));
    return;
  }
  const content = `<div class="simulation-layout"><div class="workstation"><div class="inbox-toolbar"><span>INBOX / PAYMENT REVIEW</span><span>Today, 10:48</span></div><article class="real-email"><div class="email-meta"><b>Elena Morris &lt;elena.morris@northstar-logistics.co&gt;</b><small>To: accounts@acme-corp.com · Today, 10:42</small><strong>Subject: Urgent payment update before 16:00</strong></div><div class="email-body"><p>Hello team,</p><p>I am travelling and need the bank details for our next invoice changed today. Please use the attached form and reply once complete. Do not call as I will be in a meeting.</p><p>Thanks,<br />Elena<br /><small>Chief Operations Officer</small></p><div class="email-attachment">▧ <b>Updated_payment_form.pdf</b><small>PDF · 84 KB</small></div></div></article><div class="triage-stage"><b>Review the message before acting</b><label><input type="checkbox" data-flag="domain" /> Sender uses a lookalike external domain</label><label><input type="checkbox" data-flag="urgency" /> The request creates time pressure</label><label><input type="checkbox" data-flag="payment" /> It asks to change bank details</label><label><input type="checkbox" data-flag="channel" /> It discourages a phone call</label><p class="triage-hint">Select the warning signs you would record in an incident report.</p><button class="primary-btn triage-next">Continue review</button></div></div><aside class="signal-sidebar"><b>Analyst notes</b><span>• Inspect the sender domain</span><span>• Check whether the request changes payment details</span><span>• Use an independent verification channel</span></aside></div>`;
  renderSimulationPage("email-triage", "Email triage", "EXERCISE 04 · INBOX DECISION", "Review the fictional message as an analyst. No reply, payment, or attachment is sent.", content);
  document.querySelector(".triage-next").addEventListener("click", () => {
    const selected = [...document.querySelectorAll("[data-flag]:checked")].map((input) => input.dataset.flag);
    const expected = ["domain", "urgency", "payment", "channel"];
    const missed = expected.filter((flag) => !selected.includes(flag));
    recordEvent(`flags-${selected.length}`);
    const flagFeedback = missed.length === 0
      ? `<div class="result success"><strong>Red flags identified</strong><small>You found all four warning signs.</small></div>`
      : `<div class="result fail"><strong>${missed.length} warning sign${missed.length === 1 ? "" : "s"} missed</strong><small>Review the highlighted pressure and verification clues.</small></div>`;
    document.querySelector(".triage-stage").innerHTML = `${flagFeedback}<b>Choose your response</b><div class="response-grid"><button data-response="reply">Reply and ask for details</button><button data-response="pay">Process the update</button><button data-response="verify">Verify using a known number</button><button data-response="report">Report and hold the payment</button></div>`;
    document.querySelectorAll("[data-response]").forEach((button) => button.addEventListener("click", () => {
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
