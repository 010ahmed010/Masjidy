#!/bin/bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start Express server in background
cd "$ROOT_DIR/server" && node index.js &
echo "Express server started"
cd "$ROOT_DIR"

# Wait for server to be ready
sleep 2

# Start Vite frontend (foreground)
cd "$ROOT_DIR/client" && npm run dev
