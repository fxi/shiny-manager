import { io } from "socket.io-client";

const socket = io();
const elIframe = document.getElementById("shinyFrame");

// Handle messages from Shiny iframe
window.addEventListener("message", async (event) => {
  socket.emit("message", event.data);
});

socket.on("connect", () => {
  console.log("connect");
});

socket.on("disconnect", () => {
  console.log("disconnect");
});

socket.on("init", (url) => {
  console.log("INIT", url);
  elIframe.src = url;
});

socket.on("set_title", (title) => {
  document.title = title;
});
