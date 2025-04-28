# @fxi/shiny-manager

A Node.js package for managing R Shiny application processes with a programmable reverse proxy. It provides a web interface to view and interact with Shiny apps, with features like health monitoring and process management.

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
   This builds the client-side code and prepares the server-side modules.

3. **Run the demo app**
   ```bash
   npm run test:r
   ```
   This launches the demo Shiny app on http://localhost:8080.

## Development Workflow

The project has two main components that need to be built and run together:

1. **Client-side code** (in `/client/`): Browser interface with Socket.IO
2. **Server-side code** (in `/src/`): Node.js server that manages R processes

### Development Process

1. **Make changes to client code** (in `/client/`)
2. **Build the project** to update the distribution files:
   ```bash
   npm run build
   ```
3. **Test your changes** with the demo app:
   ```bash
   npm run test:r
   ```

> **Important:** Always run `npm run build` after making changes to client code. The build process copies the client build to the `dist/public` directory, which is served by the Node.js server.

## Features

- Launch and manage R Shiny processes
- Dynamic proxy routing with WebSocket support
- Process lifecycle management and health monitoring
- Status overlay for connection, health checks, and disconnection states
- Socket.IO integration for real-time communication

## Usage

### Command Line

```bash
# Install globally
npm install -g @fxi/shiny-manager

# Start a Shiny app (default port 8080)
shiny-manager ./path/to/app.R

# Start on a specific port
shiny-manager ./path/to/app.R 3000

# Set a custom title
shiny-manager --title "My Shiny App" ./path/to/app.R

# Show help
shiny-manager --help
```

### Programmatic Usage

```javascript
import { ProgrammableProxy } from '@fxi/shiny-manager/proxy.js';
import { Session } from '@fxi/shiny-manager/session.js';

// Create a proxy
const proxy = new ProgrammableProxy();

// Create and initialize a session
const session = new Session(socket, proxy, '/path/to/app.R');
await session.init();

// Clean up when done
session.destroy();
```

## Project Structure

- `src/`: Server-side Node.js code
- `client/`: Client-side code (browser interface)
- `build/`: Build scripts
- `dist/`: (Generated) Distribution files
- `demo/`: Demo Shiny app for testing
- `test/`: Test files

## Requirements

- Node.js >= 18.0.0
- R with Shiny installed

## License

MIT
