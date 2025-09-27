DROP TABLE IF EXISTS users;

CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       status VARCHAR(50) NOT NULL DEFAULT 'active',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_status ON users(status);

INSERT INTO users (name, email, password, status)
VALUES
    ('Alice Johnson', 'alice@example.com', 'pass123', 'active'),
    ('Bob Smith', 'bob@example.com', 'pass456', 'active'),
    ('Charlie Brown', 'charlie@example.com', 'pass789', 'inactive');
