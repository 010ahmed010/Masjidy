#!/bin/bash

# Kill any existing processes
pkill -f "node server/index.js" 2>/dev/null
pkill mongod 2>/dev/null
sleep 1

# Start MongoDB
mkdir -p /tmp/mongodb-data
mongod --dbpath /tmp/mongodb-data --logpath /tmp/mongodb.log --bind_ip 127.0.0.1 --fork
echo "Waiting for MongoDB..."
sleep 3

# Start backend with auto-restart loop in background
(
  while true; do
    echo "Starting backend server..."
    node server/index.js
    echo "Backend crashed, restarting in 2 seconds..."
    sleep 2
  done
) &

# Wait for backend to be ready
sleep 4
echo "Starting frontend..."

# Start Vite frontend (this is the main process)
cd client && npm run dev
