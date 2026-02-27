# FastAPI Backend - Sathyabama APNS

A high-performance FastAPI backend for the Arrear & Progress Notification System (APNS).

## Features

- ⚡ **FastAPI**: Modern, fast, high-performance Python web framework
- 🗄️ **PostgreSQL**: Production-ready database with asyncpg for optimal performance
- 🔄 **Auto-reload**: Development server with hot-reloading
- 🛡️ **Auto-schema**: Automatic database initialization and migration
- 💾 **Memory Fallback**: Graceful in-memory mode if database unavailable
- 📝 **API Documentation**: Auto-generated interactive API docs at `/docs`

## Tech Stack

- **FastAPI** 0.115.0 - Modern Python web framework
- **Uvicorn** 0.30.0 - Lightning-fast ASGI server
- **asyncpg** 0.30.0 - High-performance PostgreSQL driver
- **Pydantic** 2.9.2 - Data validation using Python type hints
- **python-dotenv** 1.0.1 - Environment variable management

## Quick Start

### 1. Install Python Dependencies

The Python virtual environment is already configured. Dependencies are automatically installed.

```bash
# Verify installation
C:/Users/Manoj/Desktop/apns/.venv/Scripts/python.exe -m pip list
```

### 2. Start the Backend

```bash
# Development mode (with auto-reload)
npm run server:dev

# Production mode
npm run server
```

The backend will be available at **http://localhost:3001**

### 3. Start Frontend + Backend Together

```bash
npm run dev:all
```

This runs both the FastAPI backend (port 3001) and Vite frontend (port 5173) concurrently.

## API Endpoints

### Health Check
- **GET** `/api/health` - Database connection status

### Authentication
- **POST** `/api/auth/register` - Register a user account in PostgreSQL
- **POST** `/api/auth/login` - Login using email and password

### AI Evaluation
- **POST** `/api/evaluation/analyze-document` - Upload CSV/XLSX/PDF/TXT and run arrear analysis

### Students
- **GET** `/api/students` - List all students
- **POST** `/api/students` - Create a new student

### Notifications
- **GET** `/api/notifications` - List all notifications with severity
- **POST** `/api/notifications` - Create a notification

### Documentation
- **GET** `/docs` - Interactive Swagger UI documentation
- **GET** `/redoc` - Alternative ReDoc documentation

## Request/Response Examples

### Create Student
```bash
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "roll_no": "SIST2024001",
    "name": "John Doe",
    "department": "CSE",
    "semester": 5
  }'
```

### Create Notification
```bash
curl -X POST http://localhost:3001/api/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "student_id": 1,
    "message": "Assignment submission deadline",
    "status": "pending"
  }'
```

## Database Configuration

The backend connects to PostgreSQL using the `DATABASE_URL` from `.env`:

```env
DATABASE_URL=postgresql://postgres:123@localhost:5432/call
PORT=3001
```

AI configuration (optional):

```env
CEREBRUS_API_KEY=your_key_here
CEREBRUS_MODEL=llama-3.3-70b
CEREBRUS_API_BASE_URL=https://api.cerebras.ai/v1
```

### Auto-Schema Initialization

The backend automatically:
1. Creates tables if they don't exist
2. Adds missing columns to existing tables
3. Creates indexes for performance
4. Sets up triggers for auto-updating timestamps
5. Inserts sample data (only if not already present)

### Manual Schema Setup

If you need to run the schema manually:

```bash
psql -U postgres -d call -f backend/schema.sql
```

## Memory Fallback Mode

If PostgreSQL is unavailable, the backend automatically switches to **in-memory mode**:

- All CRUD operations still work
- Data persists only during the server session
- Check `/api/health` to see current mode

Health response example:
```json
{
  "ok": true,
  "dbConnected": true,
  "mode": "postgres",
  "dbError": null
}
```

## Project Structure

```
backend/
├── main.py          # FastAPI application and routes
├── database.py      # PostgreSQL connection and schema
├── schema.sql       # Production SQL schema (for manual deployment)
├── requirements.txt # Python dependencies
└── __init__.py      # Python package marker
```

## Development

### View Logs
The development server shows detailed logs including:
- Database connection status
- Request/response information
- Automatic reload triggers

### Interactive API Testing
Visit **http://localhost:3001/docs** to:
- See all available endpoints
- Test API calls directly in the browser
- View request/response schemas
- Download OpenAPI specification

## Advantages over Node.js Express

✅ **Type Safety**: Automatic request/response validation with Pydantic  
✅ **Performance**: 2-3x faster than Express in benchmarks  
✅ **Async Native**: Built-in async/await support for all operations  
✅ **Auto Documentation**: OpenAPI/Swagger docs generated automatically  
✅ **Modern Python**: Uses latest Python 3.10+ features  
✅ **Less Code**: More concise and readable than equivalent Express code  

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 3001 (Windows)
Get-NetTCPConnection -LocalPort 3001 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Database Connection Failed
1. Check PostgreSQL is running
2. Verify credentials in `.env`
3. Ensure database `call` exists
4. Backend will fallback to memory mode automatically

### Module Not Found Errors
```bash
# Reinstall dependencies
C:/Users/Manoj/Desktop/apns/.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
```

## Production Deployment

For production deployment:

1. Set environment variables properly
2. Use a production ASGI server:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 3001 --workers 4
   ```
3. Set up database connection pooling (already configured)
4. Enable HTTPS termination (nginx/Apache as reverse proxy)
5. Configure CORS origins in production (update `allow_origins` in main.py)

## Support

For issues or questions, check:
- Interactive API docs at `/docs`
- Server logs in the terminal
- Database health at `/api/health`
