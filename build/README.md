# Building Process

This directory contains the build script for bundling the application code using esbuild.

## Bundle Script

The `bundle.js` script bundles all JavaScript files using esbuild and prepares the application for distribution or Single Executable Application (SEA) creation.

## Build Process

Running `npm run build` will:

1. Bundle all JavaScript files using esbuild
2. Minify the code for better performance
3. Copy necessary files (public directory, package.json)
4. Make the CLI executable

## Single Executable Applications

The shiny-manager executables are built automatically on GitHub using GitHub Actions for each release:

1. The workflow first creates bundled JavaScript files
2. Then uses Node.js SEA (Single Executable Application) feature to create standalone executables
3. The resulting binaries are uploaded to GitHub releases

## Docker Integration

To use these executables in a Docker (Alpine) container, download the correct binary from GitHub releases based on your architecture:

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
```