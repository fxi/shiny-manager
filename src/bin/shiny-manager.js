#!/usr/bin/env node

import { createServer } from "http";
import { Server } from "socket.io";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import express from "express";
import path from "path";
import { Session } from "../session.js";
import { ProgrammableProxy } from "../proxy.js";
import packageJson from "../../package.json" assert { type: 'json' };

// Get the command-line arguments
const args = process.argv.slice(2);

// Help text
if (args.includes("-h") || args.includes("--help")) {
  console.log(`
Usage: shiny-manager [options] <path-to-app.R> [port]

Options:
  -h, --help     Show this help message
  -v, --version  Show version number

Arguments:
  path-to-app.R  Path to the R Shiny app entry point (required)
  port           Port to run the server on (default: 8080)

Examples:
  shiny-manager ./app.R
  shiny-manager ./app.R 3000
  `);
  process.exit(0);
}

// Version info
if (args.includes("-v") || args.includes("--version")) {
  console.log(`shiny-manager v${packageJson.version}`);
  process.exit(0);
}

// Check for required arguments
if (args.length < 1) {
  console.error("Error: Missing required argument <path-to-app.R>");
  console.error("Run 'shiny-manager --help' for usage information");
  process.exit(1);
}

// Get the app path and port
const appPath = path.resolve(process.cwd(), args[0]);
const port = parseInt(args[1], 10) || 8080;

// Set up the proxy and server
const proxy = new ProgrammableProxy();

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new Server(server);

// Get directory for the HTML file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the directory with index.html
app.use(express.static(path.join(__dirname, "../public")));
app.use(proxy.middleware());

// Root route serves the container page
app.get("/", async (req, res) => {
  try {
    const indexHtmlPath = path.join(__dirname, "../public/index.html");
    const content = await readFile(indexHtmlPath, "utf8");
    res.send(content);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading index.html");
  }
});

// Socket.IO connection handling
io.on("connection", async (socket) => {
  try {
    let session = new Session(socket, proxy, appPath);
    await session.init();

    socket.on("message", async (value) => {
      if (value === "restart") {
        session.destroy();
        session = new Session(socket, proxy, appPath);
        await session.init();
      }
    });

    socket.on("disconnect", async () => {
      session.destroy();
    });
  } catch (error) {
    console.error(`Error handling socket connection:`, error);
    socket.emit("error", "Failed to initialize application");
  }
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  proxy.handleUpgrade(req, socket, head);
});

// Start the server
server.listen(port, () => {
  console.log(`🚀 Shiny Manager running at http://localhost:${port}`);
  console.log(`📁 Serving Shiny app from: ${appPath}`);
  console.log(`💻 Press Ctrl+C to stop the server`);
});

// Clean up on exit
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server stopped');
    process.exit(0);
  });
});