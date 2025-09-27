-- Drop tables in reverse order to respect foreign key constraints
DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       status VARCHAR(50) NOT NULL DEFAULT 'active',
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create index on users.status
CREATE INDEX idx_users_status ON users(status);

-- Create todos table
CREATE TABLE todos (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       user_id INT NOT NULL,
                       text VARCHAR(255) NOT NULL,
                       completed BOOLEAN NOT NULL DEFAULT FALSE,
                       category VARCHAR(100) NOT NULL,
                       due_date TIMESTAMP NULL,
                       priority ENUM('low', 'medium', 'high') NOT NULL,
                       order_position INT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index on todos.user_id and todos.completed
CREATE INDEX idx_todos_user_id_completed ON todos(user_id, completed);

-- Seed users table
INSERT INTO users (name, email, password, status)
VALUES
    ('Alice Johnson', 'alice@example.com', 'pass123', 'active'),
    ('Bob Smith', 'bob@example.com', 'pass456', 'active'),
    ('sundar', 'sundar@sundar.com', '123', 'active');

-- Seed todos table (aligned with users: Alice id=1, Bob id=2, Charlie id=3)
INSERT INTO todos (user_id, text, completed, category, due_date, priority, order_position)
VALUES
    (1, 'Finish project proposal', FALSE, 'Work', '2025-10-01 17:00:00', 'high', 1),
    (1, 'Buy groceries', TRUE, 'Personal', NULL, 'medium', 2),
    (2, 'Schedule team meeting', FALSE, 'Work', '2025-09-30 10:00:00', 'medium', 1),
    (2, 'Call plumber', FALSE, 'Home', NULL, 'high', 2),
    (3, 'Update resume', FALSE, 'Career', '2025-10-15 12:00:00', 'low', 1);