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

## License

MIT
