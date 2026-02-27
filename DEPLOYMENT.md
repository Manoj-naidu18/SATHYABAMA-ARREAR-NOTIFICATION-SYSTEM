# Database Deployment Guide

## Prerequisites
- PostgreSQL 12 or higher installed
- Database named `call` created
- User credentials: `postgres:123`

## Deployment Steps

### 1. Create Database (if not exists)
```sql
CREATE DATABASE call;
```

### 2. Run Schema
Open pgAdmin or psql and execute:

**Option A: Using pgAdmin**
1. Connect to PostgreSQL server
2. Navigate to Databases → call
3. Right-click → Query Tool
4. Open file: `backend/schema.sql`
5. Execute (F5)

**Option B: Using psql command line**
```bash
psql -U postgres -d call -f backend/schema.sql
```

**Option C: Using PowerShell**
```powershell
$env:PGPASSWORD="123"
psql -U postgres -d call -f backend/schema.sql
```

### 3. Verify Installation
```sql
-- Check tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check data
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM notifications;
```

## What Gets Created

### Tables
1. **students** - Student records with contact information
2. **notifications** - Parent notification tracking

### Indexes
- `idx_students_roll_no` - Fast roll number lookups
- `idx_students_department` - Department filtering
- `idx_students_semester` - Semester filtering
- `idx_notifications_student_id` - Student notifications lookup
- `idx_notifications_status` - Status filtering

### Triggers
- Auto-update `updated_at` timestamp on record changes

### Sample Data
- 6 sample students
- 4 sample notifications

## Error Handling
- ✅ Safe to run multiple times (uses `DROP IF EXISTS`)
- ✅ No duplicate data (uses `ON CONFLICT DO NOTHING`)
- ✅ Foreign key constraints with CASCADE
- ✅ Data validation with CHECK constraints

## Backend Auto-Initialization
The backend automatically creates tables on startup if they don't exist, so manual schema execution is optional but recommended for production deployments.

## Troubleshooting

### Connection Failed
```bash
# Check PostgreSQL is running
Get-Service postgresql*

# Test connection
psql -U postgres -d call -c "SELECT version();"
```

### Permission Errors
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
```

### Reset Database
```sql
-- Drop and recreate (WARNING: Deletes all data)
DROP DATABASE call;
CREATE DATABASE call;
-- Then run schema.sql again
```
