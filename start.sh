#!/bin/bash

echo "=================================="
echo "   Syntax Project Starting..."
echo "=================================="

# Backend dependencies
echo "Installing backend packages..."
cd backend
npm install
cd ..

# Frontend dependencies
echo "Installing frontend packages..."
cd frontend
npm install
cd ..

# AI Engine setup
echo "Setting up AI Engine..."
cd ai-engine

if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate 2>/dev/null || . venv/Scripts/activate

pip install -r requirements.txt

cd ..

echo ""
echo "Starting services..."
echo ""

# AI Engine
cd ai-engine
source venv/bin/activate 2>/dev/null || . venv/Scripts/activate
python main.py &
cd ..

# Backend
cd backend
npm run dev &
cd ..

# Frontend
cd frontend
npm run dev &
cd ..

echo ""
echo "Project Started Successfully"
echo "Frontend : http://localhost:5173"
echo "Backend  : http://localhost:5000"
echo "AI Engine: http://localhost:8000"
echo ""
echo "Press Ctrl + C to stop"

wait