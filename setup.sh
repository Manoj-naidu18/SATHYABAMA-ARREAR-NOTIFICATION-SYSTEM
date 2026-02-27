#!/bin/bash

echo "============================================"
echo "APNS Project Setup"
echo "============================================"
echo ""

echo "[1/5] Installing Node.js dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed"
    exit 1
fi

echo ""
echo "[2/5] Creating Python virtual environment..."
python3 -m venv .venv
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to create virtual environment"
    exit 1
fi

echo ""
echo "[3/5] Activating virtual environment..."
source .venv/bin/activate

echo ""
echo "[4/5] Installing Python dependencies..."
pip install -r backend/requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: pip install failed"
    exit 1
fi

echo ""
echo "[5/5] Setting up environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env file - Please edit it with your database credentials"
else
    echo ".env file already exists - skipping"
fi

echo ""
echo "============================================"
echo "Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Create PostgreSQL database: CREATE DATABASE call;"
echo "3. Run: npm run dev:all"
echo ""
echo "For detailed instructions, see SETUP.md"
echo ""
