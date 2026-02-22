import { io } from "socket.io-client";

// ── User identity ──────────────────────────────────────────────────────────
let token = localStorage.getItem("shiny_token");
if (!token) {
  token = crypto.randomUUID();
  localStorage.setItem("shiny_token", token);
}

// ── Socket ─────────────────────────────────────────────────────────────────
const socket = io({ auth: { token } });

// ── DOM refs ───────────────────────────────────────────────────────────────
const elIframe = document.getElementById("shinyFrame");
const overlay = document.getElementById("com_container");
const message = document.getElementById("com");
const progressTrack = document.getElementById("progress-track");
const progressFill = document.getElementById("progress-fill");
const btnRetry = document.getElementById("btn-retry");
const controls = document.getElementById("controls");
const btnRestart = document.getElementById("btn-restart");
const btnStop = document.getElementById("btn-stop");

// ── Overlay state helpers ──────────────────────────────────────────────────
function showOverlay(text) {
  message.textContent = text;
  overlay.classList.remove("hidden");
  controls.classList.add("hidden");
  // Reset progress + retry on every new state
  progressTrack.classList.add("hidden");
  progressFill.style.width = "0%";
  btnRetry.classList.remove("visible");
}

function showProgress(attempt, max) {
  progressTrack.classList.remove("hidden");
  // Small artificial floor so the bar is visible even on attempt 1
  progressFill.style.width = `${Math.max(4, (attempt / max) * 100)}%`;
}

function showFailure() {
  message.textContent = "Could not start the application.";
  progressTrack.classList.add("hidden");
  progressFill.style.width = "0%";
  btnRetry.classList.add("visible");
  overlay.classList.remove("hidden");
  controls.classList.add("hidden");
}

function hideOverlay() {
  overlay.classList.add("hidden");
  controls.classList.remove("hidden");
}

// ── Forward postMessage events from the Shiny iframe ──────────────────────
window.addEventListener("message", (event) => {
  socket.emit("message", event.data);
});

// ── Socket events ──────────────────────────────────────────────────────────
socket.on("connect", () => {
  showOverlay("Connecting…");
});

socket.on("disconnect", () => {
  showOverlay("Reconnecting…");
});

socket.on("init", (url) => {
  elIframe.src = url;
});

socket.on("health_check", (attempt, max) => {
  if (attempt === 1) showOverlay("Starting…");
  showProgress(attempt, max);
});

socket.on("app_ready", () => {
  hideOverlay();
});

socket.on("session_failed", () => {
  showFailure();
});

socket.on("set_title", (title) => {
  document.title = title;
});

socket.on("get_title", (_, callback) => {
  callback(document.title);
});

// ── Iframe load fallback ───────────────────────────────────────────────────
elIframe.addEventListener("load", () => {
  if (elIframe.src !== "about:blank" && !elIframe.src.startsWith("blob:")) {
    setTimeout(hideOverlay, 500);
  }
});

// ── Process controls ───────────────────────────────────────────────────────
btnRetry.addEventListener("click", () => {
  showOverlay("Starting…");
  socket.emit("message", "restart");
});

btnRestart.addEventListener("click", () => {
  showOverlay("Restarting…");
  socket.emit("message", "restart");
});

btnStop.addEventListener("click", () => {
  showOverlay("Session stopped.");
  elIframe.src = "about:blank";
  socket.emit("message", "stop");
});
