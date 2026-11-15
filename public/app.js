const state = { runId: null, toastTimer: null };
const toast = (message) => {
  const element = document.querySelector(".toast");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => element.classList.remove("show"), 2800);
};
const modal = document.querySelector(".modal-backdrop");
const openModal = (title, copy, content, kicker = "SAFE SIMULATION") => {
  document.querySelector("#modal-kicker").textContent = kicker;
  document.querySelector("#modal-title").textContent = title;
  document.querySelector("#modal-copy").textContent = copy;
  document.querySelector("#modal-content").innerHTML = content;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
};
const closeModal = () => { modal.classList.remove("open"); modal.setAttribute("aria-hidden", "true"); };
const showView = (name) => {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("view-active", view.dataset.panel === name));
  document.querySelectorAll("[data-view]").forEach((link) => link.classList.toggle("active", link.dataset.view === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
};
const recordEvent = async (event) => {
  if (!state.runId) return;
  await fetch(`/api/runs/${state.runId}/events`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }) });
};
const startScenario = async (scenario) => {
  try {
    const response = await fetch("/api/runs", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scenario }) });
    if (!response.ok) throw new Error("Could not start the safe simulation.");
    const result = await response.json();
    state.runId = result.run.id;
    await recordEvent("scenario-opened");
    const labels = { "synthetic-phish": "Synthetic phishing", "voice-clone": "Voice clone callback", "automated-recon": "Automated reconnaissance" };
    openModal(labels[scenario], "This exercise is fictional and contained. Inspect the attacker technique, then identify the control that breaks the chain.", `<div class="modal-card"><b>Attacker perspective</b>${scenario === "synthetic-phish" ? "An AI model drafts a persuasive invoice-change message using a fictional context." : scenario === "voice-clone" ? "A synthetic voice creates false confidence around an urgent, fictional callback." : "An automation groups fictional public signals into a profile for defensive study."}</div><div class="modal-card" style="margin-top:8px"><b>Defender question</b>Which independent verification step would stop this from becoming a payment or access incident?</div><button class="primary-btn modal-start" style="margin-top:15px">Mark control tested</button>`, "VECTOR SIMULATION");
    document.querySelector(".modal-start").addEventListener("click", async () => { await recordEvent("defender-control-tested"); closeModal(); showView("telemetry"); toast("Control tested · telemetry recorded locally"); });
  } catch (error) {
    toast(error.message);
  }
};

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
document.querySelectorAll("[data-view-target]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.viewTarget)));
document.querySelectorAll("[data-scenario]").forEach((button) => button.addEventListener("click", () => startScenario(button.dataset.scenario)));
document.querySelector(".theme-toggle").addEventListener("click", () => {
  document.documentElement.classList.toggle("light");
  document.querySelector(".theme-toggle").textContent = document.documentElement.classList.contains("light") ? "☾" : "☼";
});
document.querySelectorAll("[data-action]").forEach((button) => button.addEventListener("click", () => {
  if (button.dataset.action === "notifications") openModal("Session notifications", "Three safe-simulation updates are waiting.", `<div class="modal-card"><b>New signal mapped</b>Voice clone callback has a new verification marker.</div><div class="modal-card" style="margin-top:8px"><b>Guardrail check</b>All traffic remains local to the lab.</div>`, "INBOX");
  if (button.dataset.action === "guardrails") openModal("Safety model", "The lab is designed to explain misuse without enabling delivery.", `<div class="modal-card"><b>Fictional by default</b>Identities, messages, and target context are synthetic.</div><div class="modal-card" style="margin-top:8px"><b>Isolated by design</b>Runs are held in memory and the API records only short event labels.</div><div class="modal-card" style="margin-top:8px"><b>Defender-first output</b>Every vector ends with an interruption point and reporting action.</div>`, "LAB GUARDRAIL");
  if (button.dataset.action === "feed") toast("Feed is already filtered to this session");
}));
document.querySelector(".modal-close").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
