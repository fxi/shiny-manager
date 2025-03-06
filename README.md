# @fxi/shiny-manager

A Node.js package for managing R Shiny application processes with a programmable reverse proxy.

## Features

- Launch and manage R Shiny processes from the command line
- Dynamic proxy routing
- WebSocket support
- Process lifecycle management
- Health monitoring
- Socket.IO integration

## Installation

### Global Installation (Recommended)

```bash
npm install -g @fxi/shiny-manager
```

### Local Installation

```bash
npm install @fxi/shiny-manager
```

## Usage

### Command Line

The simplest way to use the package is via the command line:

```bash
# Start a Shiny app on the default port (8080)
shiny-manager ./path/to/app.R

# Start a Shiny app on a specific port
shiny-manager ./path/to/app.R 3000

# Show help
shiny-manager --help
```

This will start a server that will:
1. Launch your R Shiny application
2. Provide a web interface to view and interact with it
3. Monitor the health of the application
4. Allow for restarting the application if needed

### Programmatic Usage

You can also use the package programmatically:

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

## API Reference

### ProgrammableProxy

- `register(sourcePath, targetUrl)`: Register a new proxy route
- `unregister(pathPattern)`: Unregister a proxy route
- `middleware()`: Express middleware for handling HTTP requests
- `getRoutes()`: Get all registered routes
- `handleUpgrade(req, socket, head)`: Handle WebSocket upgrade requests

### Session

- `init()`: Initialize the session and start the R process
- `destroy()`: Destroy the session and clean up resources
- `stop()`: Stop the R process
- `register()`: Register the session with the proxy
- `unregister()`: Unregister the session from the proxy
- `healthy()`: Check if the R process is healthy

## Testing

```bash
npm test
```

## Requirements

- Node.js >= 18.0.0
- R with Shiny installed


### Project Structure

The project is organized as follows:

- `src/`: Server-side Node.js code
  - `bin/`: Command-line interface
  - Other server modules
- `client/`: Client-side code (browser interface)
  - Uses Vite for bundling
  - Includes Socket.IO client
- `build/`: Build scripts
  - `build.js`: Main build script
- `dist/`: (Generated) Distribution files
  - `bin/`: CLI executable
  - `public/`: Client-side assets 

### Building the Project

To build the project:

```bash
npm run build
```

This will:
1. Build the client-side code using Vite (bundles Socket.IO client)
2. Copy server-side modules to the dist folder
3. Make the CLI executable
4. Create a ready-to-publish package in the `dist/` directory

### Development

To run the client in development mode with hot-reloading:

```bash
npm run dev
```

To run the demo Shiny app for testing (after building):

```bash
npm run test:r
```

This will launch the demo app on port 8080. You can then open http://localhost:8080 in your browser.

To build Single Executable Applications locally (requires Node.js 21+):
1. Run `npm run build` to create the bundled files
2. Use Node.js Single Executable Applications API with the provided `sea-config.json`

## License

MIT
