import asyncpg
import os
import re
from dotenv import load_dotenv

load_dotenv()


class Database:
    def __init__(self):
        self.pool = None
        self.database_url = os.getenv(
            "DATABASE_URL", "postgresql://postgres:123@localhost:5432/call"
        )
        configured_schema = os.getenv("DB_SCHEMA", "apns")
        self.db_schema = self._sanitize_schema_name(configured_schema)

    def _sanitize_schema_name(self, schema_name: str) -> str:
        """Allow only safe PostgreSQL identifier characters for schema names."""
        value = (schema_name or "apns").strip().lower()
        if not re.fullmatch(r"[a-z_][a-z0-9_]*", value):
            return "apns"
        return value

    async def initialize(self):
        """Initialize database connection and create schema"""
        try:
            # Parse connection string
            self.pool = await asyncpg.create_pool(
                self.database_url,
                command_timeout=3,
                min_size=5,
                max_size=10,
                server_settings={"search_path": self.db_schema},
            )

            # Initialize schema
            await self._init_schema()

            return {"connected": True, "error": None}
        except Exception as e:
            print(f"Database connection error: {e}")
            return {"connected": False, "error": str(e)}

    async def _init_schema(self):
        """Create tables if they don't exist"""
        schema_sql = """
        -- Users table for authentication
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(120) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role VARCHAR(30) NOT NULL DEFAULT 'admin',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

        -- Students table
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            roll_no VARCHAR(30) UNIQUE NOT NULL,
            name VARCHAR(120) NOT NULL,
            department VARCHAR(120),
            semester INTEGER CHECK (semester >= 1 AND semester <= 12),
            email VARCHAR(255),
            phone VARCHAR(20),
            parent_email VARCHAR(255),
            parent_phone VARCHAR(20),
            photo_url TEXT,
            arrears_count INTEGER DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Add missing columns if they don't exist
        ALTER TABLE students ADD COLUMN IF NOT EXISTS email VARCHAR(255);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_email VARCHAR(255);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS parent_phone VARCHAR(20);
        ALTER TABLE students ADD COLUMN IF NOT EXISTS photo_url TEXT;
        ALTER TABLE students ADD COLUMN IF NOT EXISTS arrears_count INTEGER DEFAULT 0;
        ALTER TABLE students ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
        ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

        -- Add missing notification columns
        ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'arrear';
        ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';
        ALTER TABLE IF EXISTS notifications ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

        CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_no);
        CREATE INDEX IF NOT EXISTS idx_students_department ON students(department);
        CREATE INDEX IF NOT EXISTS idx_students_semester ON students(semester);
        CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);

        -- Notifications table
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
            notification_type VARCHAR(50) DEFAULT 'arrear',
            priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
            sent_at TIMESTAMP WITH TIME ZONE,
            delivered_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_notifications_student_id ON notifications(student_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
        CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

        -- Alert actions table (SMS / Call tracking)
        CREATE TABLE IF NOT EXISTS alert_actions (
            id SERIAL PRIMARY KEY,
            student_id INTEGER NOT NULL,
            notification_id INTEGER,
            channel VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'call')),
            recipient VARCHAR(255),
            message TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
            sent_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_alert_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT fk_alert_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE SET NULL ON UPDATE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_alert_actions_student_id ON alert_actions(student_id);
        CREATE INDEX IF NOT EXISTS idx_alert_actions_channel ON alert_actions(channel);
        CREATE INDEX IF NOT EXISTS idx_alert_actions_status ON alert_actions(status);

        -- Auto-update trigger for timestamps
        CREATE OR REPLACE FUNCTION update_timestamp()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS update_students_timestamp ON students;
        CREATE TRIGGER update_students_timestamp
        BEFORE UPDATE ON students
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();

        DROP TRIGGER IF EXISTS update_notifications_timestamp ON notifications;
        CREATE TRIGGER update_notifications_timestamp
        BEFORE UPDATE ON notifications
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();

        DROP TRIGGER IF EXISTS update_alert_actions_timestamp ON alert_actions;
        CREATE TRIGGER update_alert_actions_timestamp
        BEFORE UPDATE ON alert_actions
        FOR EACH ROW
        EXECUTE FUNCTION update_timestamp();

        -- Insert sample data if not exists
        INSERT INTO students (roll_no, name, department, semester) VALUES
        ('SIST2023001', 'Arjun Kumar', 'CSE', 6),
        ('SIST2023002', 'Priya Singh', 'ECE', 4),
        ('SIST2023003', 'Rahul Verma', 'MECH', 2),
        ('SIST2023004', 'Neha Gupta', 'IT', 8),
        ('SIST2023005', 'Aditya Patel', 'CSE', 5),
        ('SIST2023006', 'Divya Sharma', 'ECE', 3)
        ON CONFLICT (roll_no) DO NOTHING;

        -- Insert sample notifications only if students already exist
        INSERT INTO notifications (student_id, message, status, notification_type, priority) 
        SELECT 
            s.id, 
            'You have pending arrears'::text, 
            'pending'::varchar, 
            'arrear'::varchar, 
            'critical'::varchar
        FROM students s 
        WHERE s.roll_no = 'SIST2023001' 
        AND NOT EXISTS (SELECT 1 FROM notifications WHERE student_id = s.id);

        INSERT INTO notifications (student_id, message, status, notification_type, priority) 
        SELECT 
            s.id,
            'Notification for semester review'::text,
            'sent'::varchar,
            'review'::varchar,
            'medium'::varchar
        FROM students s
        WHERE s.roll_no = 'SIST2023002'
        AND NOT EXISTS (SELECT 1 FROM notifications WHERE student_id = s.id);

        INSERT INTO notifications (student_id, message, status, notification_type, priority) 
        SELECT 
            s.id,
            'Deadline approaching for assignments'::text,
            'pending'::varchar,
            'reminder'::varchar,
            'high'::varchar
        FROM students s
        WHERE s.roll_no = 'SIST2023004'
        AND NOT EXISTS (SELECT 1 FROM notifications WHERE student_id = s.id);
        """

        if self.pool:
            async with self.pool.acquire() as conn:
                await conn.execute(f'CREATE SCHEMA IF NOT EXISTS "{self.db_schema}"')
                await conn.execute(f'SET search_path TO "{self.db_schema}"')
                await conn.execute(schema_sql)

    async def fetch(self, query: str, *args):
        """Execute SELECT query and return results"""
        if not self.pool:
            raise Exception("Database not initialized")

        async with self.pool.acquire() as conn:
            rows = await conn.fetch(query, *args)
            # Convert asyncpg.Record to dict
            return [dict(row) for row in rows]

    async def fetchval(self, query: str, *args):
        """Execute query and return single value"""
        if not self.pool:
            raise Exception("Database not initialized")

        async with self.pool.acquire() as conn:
            return await conn.fetchval(query, *args)

    async def execute(self, query: str, *args):
        """Execute non-SELECT query"""
        if not self.pool:
            raise Exception("Database not initialized")

        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)

    async def close(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
