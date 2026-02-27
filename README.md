# APNS - Arrear & Progress Notification System

Sathyabama University's comprehensive student management and notification system.

## 🚀 For Team Members

**New to the project?** Follow the [**SETUP.md**](SETUP.md) guide for complete step-by-step instructions.

## Project Stack

- **Frontend**: React 18 + Vite 6 + Tailwind CSS 4
- **Backend**: FastAPI (Python 3.10+) with Uvicorn
- **Database**: PostgreSQL 12+ with asyncpg
- **API Documentation**: Auto-generated at `/docs`

## Features

✅ Student Management Dashboard  
✅ Real-time Notifications System  
✅ Arrear Tracking & Alerts  
✅ Role-based Authentication (Login/Register)  
✅ Auto-schema Database Initialization  
✅ Memory Fallback Mode  
✅ Interactive API Documentation

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file should contain:

```env
DATABASE_URL=postgresql://postgres:123@localhost:5432/call
PORT=3001
```

### 3. Run the Application

**Start everything together (recommended):**

```bash
npm run dev:all
```

This starts:

- FastAPI backend at **http://localhost:3001**
- React frontend at **http://localhost:5173**

**Or run separately:**

```bash
# Frontend only
npm run dev

# Backend only
npm run server:dev
```

## Database Setup

The backend **automatically** initializes the database schema on startup. No manual SQL execution needed!

### Manual Schema Setup (Optional)

If you prefer manual control:

```bash
# Using psql
psql -U postgres -d call -f backend/schema.sql

# Using pgAdmin
# Open backend/schema.sql and run it in Query Tool
```

**Note**: If PostgreSQL is unavailable, the backend gracefully falls back to in-memory mode so the app continues working.

## API Documentation

Visit **http://localhost:3001/docs** for interactive Swagger UI documentation where you can:

- Test all API endpoints
- View request/response schemas
- See real-time examples

Alternative documentation: **http://localhost:3001/redoc**

## Project Structure

```
apns/
├── src/                    # React frontend
│   ├── app/
│   │   ├── pages/         # Login, Dashboard, Management, etc.
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Utilities
│   ├── assets/            # Images and static files
│   └── styles/            # CSS and Tailwind
├── backend/               # FastAPI backend
│   ├── main.py           # API routes and application
│   ├── database.py       # PostgreSQL connection
│   ├── schema.sql        # Production schema
│   ├── requirements.txt  # Python dependencies
│   └── README.md         # Backend documentation
├── .env                  # Environment configuration
└── package.json          # Node.js scripts
```

## Available Scripts

| Command              | Description                            |
| -------------------- | -------------------------------------- |
| `npm run dev:all`    | Run frontend + backend together        |
| `npm run dev`        | Run frontend only (Vite dev server)    |
| `npm run server:dev` | Run backend only (FastAPI with reload) |
| `npm run server`     | Run backend in production mode         |
| `npm run build`      | Build frontend for production          |

## Key Endpoints

- `GET /api/health` - Check backend and database status
- `POST /api/auth/register` - Create user account in PostgreSQL
- `POST /api/auth/login` - Login using registered account
- `POST /api/evaluation/analyze-document` - Upload CSV/XLSX/PDF/TXT and run AI analysis
- `GET /api/students` - List all students
- `POST /api/students` - Create a new student
- `GET /api/notifications` - List all notifications
- `POST /api/notifications` - Create a notification

## Technology Highlights

### FastAPI Backend

- **High Performance**: 2-3x faster than Node.js Express
- **Type Safety**: Automatic request validation with Pydantic
- **Async Native**: Built for modern async/await patterns
- **Auto Documentation**: OpenAPI/Swagger generated automatically

### Frontend

- **Motion Animations**: Smooth, reactive UI transitions
- **Radix UI**: Accessible component library
- **React Router 7**: Modern routing solution
- **Tailwind CSS 4**: Utility-first styling

### Database

- **asyncpg**: High-performance async PostgreSQL driver
- **Auto-migrations**: Schema automatically updates on startup
- **Connection Pooling**: Optimized for concurrent requests
- **Fallback Mode**: Continues working if database unavailable

## Troubleshooting

### Port Already in Use

**Windows PowerShell:**

```powershell
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Database Connection Issues

1. Verify PostgreSQL is running
2. Check `.env` credentials
3. Ensure database `call` exists
4. Backend will auto-switch to memory mode if connection fails

### Check Backend Status

```bash
curl http://localhost:3001/api/health
```

Expected response:

```json
{
  "ok": true,
  "dbConnected": true,
  "mode": "postgres",
  "dbError": null
}
```

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot-reloading
2. **API Testing**: Use `/docs` for interactive endpoint testing
3. **Database Logs**: Backend shows detailed connection status
4. **CORS**: Already configured for `localhost` development

## Production Deployment

1. Build the frontend: `npm run build`
2. Serve the `dist/` folder with a static server
3. Run backend with multiple workers:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 3001 --workers 4
   ```
4. Set up nginx as reverse proxy
5. Configure proper CORS origins in `backend/main.py`
6. Use environment variables for sensitive data

See [backend/README.md](backend/README.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for detailed production setup.

## Deploy Online (Public)

Use this 2-service setup so everyone can access your app:

1. **Deploy backend to Render**

- Connect this GitHub repo in Render
- Render will detect [render.yaml](render.yaml)
- Set required secret env vars in Render:
  - `DATABASE_URL`
  - `CEREBRUS_API_KEY` (optional if AI feature not needed)
- After deploy, copy backend URL (example: `https://apns-backend.onrender.com`)

2. **Set Vercel rewrite to backend URL**

- Open [vercel.json](vercel.json)
- Replace `https://REPLACE_WITH_BACKEND_URL` with your Render backend URL

3. **Deploy frontend to Vercel**

- Import the same GitHub repo in Vercel
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Deploy

4. **Verify**

- Open your Vercel site URL
- Check API via `https://<your-vercel-domain>/api/health`

## License

© 2026 Sathyabama University APNS Project

---

**Need Help?**

- Check `/docs` for API documentation
- Review backend logs for errors
- Verify `/api/health` endpoint status
