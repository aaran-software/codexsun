-- Drop the todos table if it exists
DROP TABLE IF EXISTS todos;

-- Create the todos table
CREATE TABLE todos (
                       id INT AUTO_INCREMENT PRIMARY KEY,
                       user_id INT NOT NULL,
                       text VARCHAR(255) NOT NULL,
                       completed BOOLEAN NOT NULL DEFAULT FALSE,
                       category VARCHAR(100) NOT NULL,
                       due_date DATE NULL,
                       priority ENUM('low', 'medium', 'high') NOT NULL,
                       order_position INT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create an index on user_id and completed for efficient filtering
CREATE INDEX idx_todos_user_id_completed ON todos(user_id, completed);

-- Insert seed data for todos (aligned with users: Alice id=1, Bob id=2, Charlie id=3)
INSERT INTO todos (user_id, text, completed, category, due_date, priority, order_position)
VALUES
    (1, 'Finish project proposal', FALSE, 'Work', '2025-10-01 17:00:00', 'high', 1),
    (1, 'Buy groceries', TRUE, 'Personal', NULL, 'medium', 2),
    (2, 'Schedule team meeting', FALSE, 'Work', '2025-09-30 10:00:00', 'medium', 1),
    (2, 'Call plumber', FALSE, 'Home', NULL, 'high', 2),
    (3, 'Update resume', FALSE, 'Career', '2025-10-15 12:00:00', 'low', 1);