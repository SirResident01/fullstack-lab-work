-- Run this in pgAdmin's Query Tool if you want to create DB/user manually.

-- Create database (if not exists)
-- Adjust ownership as needed. By default, the 'postgres' superuser owns it.
CREATE DATABASE cardb;

-- (Optional) Create dedicated app user:
-- CREATE USER lab_user WITH PASSWORD 'lab_pass';
-- GRANT ALL PRIVILEGES ON DATABASE cardb TO lab_user;

-- After DB creation, connect to 'cardb' and grant schema privileges if you use a non-superuser:
-- \c cardb
-- GRANT ALL ON SCHEMA public TO lab_user;
