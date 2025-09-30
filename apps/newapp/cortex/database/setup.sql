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
                                                   ('tenant_1', 'tenant_1'),
                                                   ('tenant_2', 'tenant_2');

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

-- Clear existing data
TRUNCATE TABLE users;
TRUNCATE TABLE revoked_tokens;

-- Seed data for tenant_1
-- Password hash for 'password123' (bcrypt, 10 salt rounds)
SET @password_hash = '$2b$10$z5X9Y7k3L9pQz5x4v6q5e2Q2z5X8Y7k3L9pQz5x4v6q5e2Q2z5X';
INSERT INTO users (username, email, password_hash, tenant_id) VALUES
                                                                  ('user1_tenant1', 'user1@tenant1.com', @password_hash, 'tenant1'),
                                                                  ('user2_tenant1', 'user2@tenant1.com', @password_hash, 'tenant1');

-- Sample revoked token (expired for testing)
INSERT INTO revoked_tokens (token, expiry, tenant_id) VALUES
    ('sample.revoked.token.tenant1', '2025-09-30 12:00:00', 'tenant1');

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

-- Clear existing data
TRUNCATE TABLE users;
TRUNCATE TABLE revoked_tokens;

-- Seed data for tenant_2
-- Same password hash for 'password123'
INSERT INTO users (username, email, password_hash, tenant_id) VALUES
                                                                  ('user1_tenant2', 'user1@tenant2.com', @password_hash, 'tenant2'),
                                                                  ('user2_tenant2', 'user2@tenant2.com', @password_hash, 'tenant2');

-- Sample revoked token (non-expired for testing)
INSERT INTO revoked_tokens (token, expiry, tenant_id) VALUES
    ('sample.revoked.token.tenant2', '2025-10-01 12:00:00', 'tenant2');