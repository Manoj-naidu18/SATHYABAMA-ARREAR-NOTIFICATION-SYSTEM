@echo off
echo ============================================
echo APNS Project Setup
echo ============================================
echo.

echo [1/5] Installing Node.js dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/5] Creating Python virtual environment...
python -m venv .venv
if errorlevel 1 (
    echo ERROR: Failed to create virtual environment
    pause
    exit /b 1
)

echo.
echo [3/5] Activating virtual environment...
call .venv\Scripts\activate.bat

echo.
echo [4/5] Installing Python dependencies...
pip install -r backend\requirements.txt
if errorlevel 1 (
    echo ERROR: pip install failed
    pause
    exit /b 1
)

echo.
echo [5/5] Setting up environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env file - Please edit it with your database credentials
) else (
    echo .env file already exists - skipping
)

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Edit .env file with your database credentials
echo 2. Create PostgreSQL database: CREATE DATABASE call;
echo 3. Run: npm run dev:all
echo.
echo For detailed instructions, see SETUP.md
echo.
pause
