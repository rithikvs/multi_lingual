#!/bin/bash

# Quick Start Script for Sign Language Application
# Starts both Backend and Frontend servers

echo ""
echo "========================================"
echo "Sign Language App - Full Stack Startup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "ERROR: Backend folder not found!"
    echo "Make sure you're running this script from the project root."
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "ERROR: Frontend folder not found!"
    echo "Make sure you're running this script from the project root."
    exit 1
fi

echo "Starting Backend Server..."
echo ""
cd backend
npm install
npm start &
BACKEND_PID=$!

echo ""
echo "Waiting 5 seconds for backend to start..."
sleep 5

echo "Starting Frontend Server..."
echo ""
cd ../frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "✅ Both servers are starting!"
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Open Login page in your browser:"
echo "http://localhost:5173/login"
echo "========================================"
echo ""

wait
