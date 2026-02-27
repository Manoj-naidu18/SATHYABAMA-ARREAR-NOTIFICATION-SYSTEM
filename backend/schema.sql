-- =====================================================
-- APNS Database Schema for PostgreSQL
-- Database: call
-- Schema: apns
-- Description: Sathyabama Arrear Management System
-- =====================================================

CREATE SCHEMA IF NOT EXISTS apns;
SET search_path TO apns;

-- Drop tables if they exist (for clean deployments)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS alert_actions CASCADE;

-- =====================================================
-- USERS TABLE (AUTHENTICATION)
-- =====================================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
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

-- Create indexes for faster queries
CREATE INDEX idx_students_roll_no ON students(roll_no);
CREATE INDEX idx_students_department ON students(department);
CREATE INDEX idx_students_semester ON students(semester);
CREATE INDEX idx_students_active ON students(is_active);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
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
  
  -- Foreign key constraint with CASCADE delete
  CONSTRAINT fk_student
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_notifications_student_id ON notifications(student_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- ALERT ACTIONS TABLE (SMS/CALL TRACKING)
-- =====================================================
CREATE TABLE alert_actions (
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
  CONSTRAINT fk_alert_student
    FOREIGN KEY (student_id)
    REFERENCES students(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_alert_notification
    FOREIGN KEY (notification_id)
    REFERENCES notifications(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE
);

CREATE INDEX idx_alert_actions_student_id ON alert_actions(student_id);
CREATE INDEX idx_alert_actions_channel ON alert_actions(channel);
CREATE INDEX idx_alert_actions_status ON alert_actions(status);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alert_actions_updated_at
  BEFORE UPDATE ON alert_actions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (Safe for production - won't duplicate)
-- =====================================================
INSERT INTO students (roll_no, name, department, semester, email, parent_email, arrears_count) VALUES
('SIST2023001', 'Arjun Kumar', 'CSE', 6, 'arjun.kumar@sathyabama.ac.in', 'arjun.parent@gmail.com', 4),
('SIST2023002', 'Priya Singh', 'ECE', 4, 'priya.singh@sathyabama.ac.in', 'priya.parent@gmail.com', 2),
('SIST2023003', 'Rahul Verma', 'MECH', 2, 'rahul.verma@sathyabama.ac.in', 'rahul.parent@gmail.com', 1),
('SIST2023004', 'Ananya Reddy', 'IT', 5, 'ananya.reddy@sathyabama.ac.in', 'ananya.parent@gmail.com', 5),
('SIST2023005', 'Vikram Malhotra', 'EEE', 3, 'vikram.m@sathyabama.ac.in', 'vikram.parent@gmail.com', 3),
('SIST2023006', 'Sneha Kapur', 'CIVIL', 6, 'sneha.kapur@sathyabama.ac.in', 'sneha.parent@gmail.com', 0)
ON CONFLICT (roll_no) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (student_id, message, status, priority, notification_type, sent_at) VALUES
(1, 'Dear Parent, Your ward Arjun Kumar has 4 arrears in the current semester. Please ensure proper attention to studies.', 'sent', 'critical', 'arrear', CURRENT_TIMESTAMP),
(2, 'Dear Parent, Your ward Priya Singh has 2 arrears. Immediate action recommended.', 'sent', 'medium', 'arrear', CURRENT_TIMESTAMP),
(4, 'Dear Parent, Your ward Ananya Reddy has 5 arrears. This requires urgent attention.', 'pending', 'critical', 'arrear', NULL),
(5, 'Dear Parent, Your ward Vikram Malhotra has 3 arrears in this semester.', 'pending', 'high', 'arrear', NULL)
ON CONFLICT DO NOTHING;

-- =====================================================
-- GRANT PERMISSIONS (Optional - adjust as needed)
-- =====================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA apns TO your_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA apns TO your_user;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment to verify the setup:
-- SELECT 'Students count:', COUNT(*) FROM students;
-- SELECT 'Notifications count:', COUNT(*) FROM notifications;
-- SELECT 'Tables created:', tablename FROM pg_tables WHERE schemaname = 'apns' ORDER BY tablename;
