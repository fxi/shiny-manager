# @fxi/shiny-manager

A Node.js package for managing R Shiny application processes with a programmable reverse proxy.
It provides a browser interface to interact with Shiny apps, featuring a pre-warmed session pool
for near-instant load times, token-based session stickiness across browser refreshes, and basic
process controls.

## Quick Start for Development

1. **Clone and install dependencies**
   ```bash
   git clone https://github.com/fxi/shiny-manager.git
   cd shiny-manager
   npm install
   ```

2. **Build the project**
   ```bash
   npm run build
   ```

3. **Run the demo app**
   ```bash
   npm run test:r
   ```
   This launches the demo Shiny app on http://localhost:8080.

## Features

- **Pre-warmed session pool** — R processes are started in the background at server startup so
  users connect to a ready session instead of waiting for a cold start.
- **Session stickiness** — each browser profile receives a stable token (stored in
  `localStorage`) that maps it back to its R session across page refreshes and reconnects.
- **30-minute idle TTL** — disconnected sessions stay alive for 30 minutes, then are cleaned up
  automatically. The pool replenishes itself so the next user always finds a warm session.
- **Process controls** — Restart and Stop buttons are exposed in the UI for quick process
  management without touching the server.
- **Dynamic proxy routing** with full WebSocket support (required by Shiny).
- **Graceful fallback** — if the pool is empty (e.g. all seats taken), new users get a cold-start
  session with a progress indicator.

## Usage

### Command Line

```bash
# Install globally
npm install -g @fxi/shiny-manager

# Start a Shiny app (default port 8080, pool of 2 idle sessions)
shiny-manager ./path/to/app.R

# Start on a specific port
shiny-manager ./path/to/app.R 3000

# Set a custom title and pool size
shiny-manager --title "My App" --pool 3 ./path/to/app.R

# Show help
shiny-manager --help
```

#### Options

| Flag | Default | Description |
|------|---------|-------------|
| `-t, --title <title>` | `"Shiny App Manager"` | Browser tab title |
| `-n, --pool <n>` | `2` | Number of pre-warmed idle sessions to keep ready |
| `<port>` | `8080` | Port for the Node.js server |

### Programmatic Usage

```javascript
import { ProgrammableProxy } from '@fxi/shiny-manager/proxy.js';
import { Session } from '@fxi/shiny-manager/session.js';
import { SessionPool } from '@fxi/shiny-manager/pool.js';

const proxy = new ProgrammableProxy();

// Pool approach (recommended)
const pool = new SessionPool(proxy, '/path/to/app.R', 2);
pool.warm(); // start background pre-warming

// On user connect
const session = pool.claim(userToken);
pool.attach(userToken, socket, title);

// On user disconnect (keep session alive)
pool.release(userToken);

// On explicit stop
pool.evict(userToken);

// Direct session usage (cold start)
const session = new Session(socket, proxy, '/path/to/app.R');
await session.init();
session.destroy();
```

## Development Workflow

The project has two main components:

1. **Client-side code** (`/client/`) — browser interface built with Vite + Socket.IO
2. **Server-side code** (`/src/`) — Node.js server that manages R processes

After making changes, rebuild and test:

```bash
npm run build
npm run test:r   # starts server at http://localhost:8080
npm test         # runs unit tests (Vitest)
```

> **Important:** Always run `npm run build` after changing client code. The build copies the
> Vite output to `dist/public/`, which is served by the Node.js server.

## Project Structure

```
src/          Server-side Node.js code
  bin/        CLI entry point (shiny-manager)
  pool.js     SessionPool — pre-warming and token-based stickiness
  session.js  Session — R process lifecycle and proxy registration
  proxy.js    ProgrammableProxy — HTTP + WebSocket reverse proxy
  utils.js    Port allocation, wait helper
client/       Client-side code (Vite build)
build/        Build scripts
dist/         (Generated) Distribution files
demo/         Demo Shiny app for testing
test/         Unit tests (Vitest)
```

## Requirements

- Node.js >= 18.0.0
- R with the `shiny` package installed

## License

MIT
