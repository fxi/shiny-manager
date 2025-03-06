#!/bin/bash
set -e

echo "🔍 Testing shiny-manager in Docker..."

echo "📦 Building Docker image..."
docker build -t shiny-manager-test -f Dockerfile .

echo "🚀 Running Docker container..."
docker run --rm shiny-manager-test

echo "✅ Docker test passed!"