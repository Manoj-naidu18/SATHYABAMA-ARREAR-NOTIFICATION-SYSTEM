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
    cat > .env << 'EOF'
API_PORT=3001
PORT=3001
DATABASE_URL=postgresql://postgres:123@localhost:5432/call

# PostgreSQL (call database)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=call
DB_USER=postgres
DB_PASSWORD=123

# DB schema used by this project
DB_SCHEMA=apns

# AI analysis (Cerebras/Cerebrus)
CEREBRUS_API_KEY=
CEREBRUS_MODEL=llama-3.3-70b
CEREBRUS_API_BASE_URL=https://api.cerebras.ai/v1
EOF
    echo "Created .env file with defaults - Please update credentials if needed"
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
