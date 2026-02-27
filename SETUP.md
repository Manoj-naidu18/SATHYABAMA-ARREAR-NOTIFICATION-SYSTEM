# Setup Guide for Team Members

## Prerequisites

Before you start, ensure you have the following installed:

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.10 or higher) - [Download](https://www.python.org/downloads/)
3. **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
4. **Git** - [Download](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone <repository-url>
cd apns
```

## Step 2: Install Node.js Dependencies

```bash
npm install
```

This will install all frontend dependencies (React, Vite, Tailwind, etc.)

## Step 3: Setup Python Virtual Environment

### On Windows:
```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
```

### On macOS/Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

## Step 4: Configure Environment Variables

Create or update `.env` directly:

```bash
API_PORT=3001
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/call
```

Then edit `.env` file with your actual database credentials:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/call
```

## Step 5: Setup PostgreSQL Database

### Create the Database

Open PostgreSQL terminal (psql) or pgAdmin and run:

```sql
CREATE DATABASE call;
```

**That's it!** The backend will automatically create all tables when it starts.

### Optional: Run Schema Manually

If you prefer to create tables manually:

```bash
psql -U postgres -d call -f backend/schema.sql
```

## Step 6: Run the Application

### Option 1: Run Everything Together (Recommended)

```bash
npm run dev:all
```

This starts:
- ✅ FastAPI backend at **http://localhost:3001**
- ✅ React frontend at **http://localhost:5173**

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server:dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Verification

### Check if everything is running:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   ```
   Expected: `{"ok": true, "dbConnected": true, "mode": "postgres"}`

2. **Frontend:**
   Open browser: http://localhost:5173

3. **API Documentation:**
   Open browser: http://localhost:3001/docs

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Start both frontend and backend |
| `npm run dev` | Start frontend only (Vite) |
| `npm run server:dev` | Start backend only (FastAPI) |
| `npm run build` | Build frontend for production |

## Project Structure

```
apns/
├── backend/              # FastAPI Backend
│   ├── main.py          # API routes
│   ├── database.py      # Database connection
│   ├── requirements.txt # Python dependencies
│   └── schema.sql       # Database schema
├── src/                 # React Frontend
│   ├── app/            # Components and pages
│   ├── assets/         # Images and files
│   └── styles/         # CSS files
├── .env                # Environment variables (create this)
├── package.json        # Node.js dependencies
└── README.md           # Documentation
```

## Troubleshooting

### Port Already in Use

**Windows:**
```powershell
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

**macOS/Linux:**
```bash
lsof -ti:3001 | xargs kill -9
```

### Database Connection Failed

1. Check PostgreSQL is running
2. Verify database `call` exists
3. Check credentials in `.env` file
4. The backend will automatically use memory fallback mode if DB is unavailable

### Python Module Not Found

Make sure virtual environment is activated:
```bash
# Windows
.venv\Scripts\activate

# macOS/Linux
source .venv/bin/activate
```

Then reinstall dependencies:
```bash
pip install -r backend/requirements.txt
```

### Node Modules Issues

```bash
rm -rf node_modules package-lock.json
npm install
```

## Dependencies Overview

### Python Dependencies (backend/requirements.txt)
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `asyncpg` - PostgreSQL driver
- `pydantic` - Data validation
- `python-dotenv` - Environment variables

### Node.js Dependencies (package.json)
- `react` - UI library
- `vite` - Build tool
- `tailwindcss` - CSS framework
- `motion` - Animations
- And more...

## Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment instructions.

## Getting Help

- Check API docs: http://localhost:3001/docs
- Review logs in terminal
- Check backend health: `/api/health`
- Read [README.md](README.md) for more details

## Quick Start Summary

```bash
# 1. Clone repo
git clone <repo-url> && cd apns

# 2. Install dependencies
npm install
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install -r backend\requirements.txt

# 3. Setup environment
# Create .env and add your database credentials

# 4. Create database
# In psql: CREATE DATABASE call;

# 5. Run everything
npm run dev:all

# 6. Open browser
# Frontend: http://localhost:5173
# API Docs: http://localhost:3001/docs
```

---

**Welcome to the team! 🚀**

If you encounter any issues during setup, contact the team lead or check the documentation.
