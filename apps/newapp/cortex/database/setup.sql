-- Drop databases to ensure clean state
DROP DATABASE IF EXISTS master_db;
DROP DATABASE IF EXISTS tenant_1;
DROP DATABASE IF EXISTS tenant_2;

-- Master Database Setup
CREATE DATABASE master_db;
USE master_db;

-- Table for tenant metadata
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id VARCHAR(255) PRIMARY KEY,
    database_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant_id (tenant_id)
);

-- Clear existing tenant data
TRUNCATE TABLE tenants;

-- Seed data for tenants
INSERT INTO tenants (tenant_id, database_name) VALUES
    ('tenant1', 'tenant_1'),
    ('tenant2', 'tenant_2');

-- Tenant 1 Database Setup
CREATE DATABASE tenant_1;
USE tenant_1;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_email_tenant (email, tenant_id),
    INDEX idx_tenant_id (tenant_id)
);

-- Revoked tokens table
CREATE TABLE IF NOT EXISTS revoked_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    expiry TIMESTAMP NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token(255)),
    INDEX idx_expiry (expiry)
);

CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(255) NOT NULL,
    completed TINYINT(1) DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    due_date DATE DEFAULT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL,
    tenant_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    position INT NOT NULL
);

-- Clear existing data
TRUNCATE TABLE users;
TRUNCATE TABLE revoked_tokens;
TRUNCATE TABLE todos;

-- Seed data for tenant_1
-- Password hash for 'password123' (bcrypt, 10 rounds)
SET @password_hash = '$2b$10$Qo5JqcVzjGZ0Af8T5hgds.7HnfbWjmAPJcwXwbvmgfcgJpFNwHxiK';
-- Password hash for 'admin123' (bcrypt, 10 rounds)
SET @admin_password_hash = '$2b$10$x0aKXyaw5FpQXDsz.s8pce/tFTkKmTesgZfREI0twTzl4J91j.cEW';

INSERT INTO users (username, email, password_hash, tenant_id, role) VALUES
    ('user1_tenant1', 'user1@tenant1.com', @password_hash, 'tenant1', 'user'),
    ('user2_tenant1', 'user2@tenant1.com', @password_hash, 'tenant1', 'user'),
    ('admin', 'admin@example.com', @admin_password_hash, 'tenant1', 'admin'),
    ('sundar', 'sundar@sundar.com', @admin_password_hash, 'tenant1', 'admin');

-- Sample revoked token (non-expired for testing)
INSERT INTO revoked_tokens (token, expiry, tenant_id) VALUES
    ('sample.revoked.token.tenant1', '2025-10-01 12:00:00', 'tenant1');

-- Dummy todos for tenant_1
INSERT INTO todos (text, completed, category, due_date, priority, tenant_id, position) VALUES
    ('Complete ERP module implementation', 0, 'Work', '2025-10-05', 'high', 'tenant1', 1),
    ('Review financial reports', 1, 'Work', NULL, 'medium', 'tenant1', 2),
    ('Schedule team meeting', 0, 'Personal', '2025-10-10', 'low', 'tenant1', 3),
    ('Update inventory database', 0, 'Other', '2025-10-15', 'high', 'tenant1', 4);

-- Tenant 2 Database Setup
CREATE DATABASE tenant_2;
USE tenant_2;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_email_tenant (email, tenant_id),
    INDEX idx_tenant_id (tenant_id)
);

-- Revoked tokens table
CREATE TABLE IF NOT EXISTS revoked_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    expiry TIMESTAMP NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token(255)),
    INDEX idx_expiry (expiry)
);

CREATE TABLE IF NOT EXISTS todos (
     id INT AUTO_INCREMENT PRIMARY KEY,
     text VARCHAR(255) NOT NULL,
     completed TINYINT(1) DEFAULT 0,
     category VARCHAR(50) NOT NULL,
     due_date DATE DEFAULT NULL,
     priority ENUM('low', 'medium', 'high') NOT NULL,
     tenant_id VARCHAR(50) NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     position INT NOT NULL
);

-- Clear existing data
TRUNCATE TABLE users;
TRUNCATE TABLE revoked_tokens;
TRUNCATE TABLE todos;

-- Seed data for tenant_2
-- Same password hashes
INSERT INTO users (username, email, password_hash, tenant_id, role) VALUES
    ('user1_tenant2', 'user1@tenant2.com', @password_hash, 'tenant2', 'user'),
    ('user2_tenant2', 'user2@tenant2.com', @password_hash, 'tenant2', 'user'),
    ('admin', 'admin@example.com', @admin_password_hash, 'tenant2', 'admin');

-- Sample revoked token (non-expired for testing)
INSERT INTO revoked_tokens (token, expiry, tenant_id) VALUES
    ('sample.revoked.token.tenant2', '2025-10-01 12:00:00', 'tenant2');

-- Dummy todos for tenant_2
INSERT INTO todos (text, completed, category, due_date, priority, tenant_id, position) VALUES
    ('Complete ERP module implementation2', 0, 'Work', '2025-10-05', 'high', 'tenant2', 1),
    ('Review financial reports2', 1, 'Work', NULL, 'medium', 'tenant2', 2),
    ('Schedule team meeting2', 0, 'Personal', '2025-10-10', 'low', 'tenant2', 3),
    ('Update inventory database2', 0, 'Other', '2025-10-15', 'high', 'tenant2', 4);
