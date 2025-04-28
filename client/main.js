import { io } from "socket.io-client";

const socket = io();
const elIframe = document.getElementById("shinyFrame");
const overlay = document.getElementById('com_container');
const message = document.getElementById('com');

function showOverlay(text) {
  console.log(`%cSHOW OVERLAY: ${text}`, 'color: blue; font-weight: bold;');
  message.textContent = text;
  overlay.classList.remove('hidden');
}

function hideOverlay() {
  console.log('%cHIDE OVERLAY', 'color: red; font-weight: bold;');
  overlay.classList.add('hidden');
}

// Handle messages from Shiny iframe
window.addEventListener("message", async (event) => {
  socket.emit("message", event.data);
});

socket.on("connect", () => {
  console.log("connect");
  showOverlay('Connecting to application...');
});

socket.on("disconnect", () => {
  console.log("disconnect");
  showOverlay('Disconnected. Attempting to reconnect...');
});

socket.on("init", (url) => {
  console.log("INIT", url);
  // Don't show overlay here - we're already showing either "Connecting..." or "Health check..."
  elIframe.src = url;
});

// Add new events for health check status
socket.on('health_check', (attempt, max) => {
  showOverlay(`Health check in progress (${attempt}/${max})...`);
});

socket.on('app_ready', () => {
  
  hideOverlay();
});

// Handle iframe load event - add back hide as a backup in case app_ready is missed
elIframe.addEventListener('load', () => {
  console.log('Iframe loaded:', elIframe.src);
  // Only hide if the src is not the initial blank page
  if (elIframe.src !== 'about:blank' && !elIframe.src.startsWith('blob:')) {
    // Add a small delay to ensure the app is truly ready
    setTimeout(() => {
      hideOverlay();
      console.log('Overlay hidden by iframe load (backup)');
    }, 500);
  }
});

socket.on("set_title", (title) => {
  document.title = title;
});

socket.on("get_title", (_, callback) => {
  callback(document.title);
});
