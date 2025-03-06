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

## Single Executable Applications

Starting with version 1.0.1, you can download pre-built standalone executables from GitHub releases that don't require Node.js to be installed.

The executables are automatically built by GitHub Actions for each release:
- `shiny-manager-x64-linux` - For x64 Linux
- `shiny-manager-arm64-linux` - For ARM64 Linux

### Docker Usage Example

```dockerfile
FROM alpine:latest

# Set ARG for architecture
ARG TARGETARCH=amd64

# Install required dependencies
RUN apk add --no-cache wget ca-certificates

# Set the executable name based on architecture
RUN if [ "$TARGETARCH" = "arm64" ]; then \
      EXEC_NAME="shiny-manager-arm64-linux"; \
    else \
      EXEC_NAME="shiny-manager-x64-linux"; \
    fi && \
    wget -O /usr/local/bin/shiny-manager "https://github.com/fxi/shiny-manager/releases/latest/download/$EXEC_NAME" && \
    chmod +x /usr/local/bin/shiny-manager

# Rest of your Dockerfile...
```

### Building the Project

To build the bundled JavaScript files:

```bash
npm run build
```

This will create optimized bundled files in the `dist/` directory. The build script:
1. Uses esbuild to bundle the JavaScript files
2. Copies the public directory
3. Makes the CLI executable

To build Single Executable Applications locally (requires Node.js 21+):
1. Run `npm run build` to create the bundled files
2. Use Node.js Single Executable Applications API with the provided `sea-config.json`

## License

MIT
