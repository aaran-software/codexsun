-- Projects Table: Core entity for grouping tasks.
CREATE TABLE IF NOT EXISTS projects (
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        name TEXT NOT NULL,
                                        description TEXT,
                                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users Table: For task assignees and note authors.
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     name TEXT NOT NULL,
                                     email TEXT UNIQUE NOT NULL,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks Table: Detailed tasks with status, priority (e.g., for 'tough' tasks), and relations.
CREATE TABLE IF NOT EXISTS tasks (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     project_id INTEGER NOT NULL,
                                     title TEXT NOT NULL,
                                     description TEXT,
                                     status TEXT DEFAULT 'todo',  -- Options: 'todo', 'in_progress', 'done'
                                     priority TEXT DEFAULT 'medium',  -- Options: 'low', 'medium', 'high' (use 'high' for tough/challenging tasks)
                                     assignee_id INTEGER,
                                     due_date DATE,
                                     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                     FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
    );

-- Centralized Notes Table: For remarks, comments, replies (threaded via parent_id).
CREATE TABLE IF NOT EXISTS notes (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task')),  -- Restrict to valid entities
    entity_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER,  -- Self-referential for replies/threads
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE
    );

-- Attachments Table: Files linked to entities (projects, tasks, notes) with metadata.
CREATE TABLE IF NOT EXISTS attachments (
                                           id INTEGER PRIMARY KEY AUTOINCREMENT,
                                           entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'note')),  -- Restrict to valid entities
    entity_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,  -- e.g., '/uploads/project1/file.pdf' (handle storage in app logic)
    file_type TEXT,  -- e.g., 'application/pdf', 'image/jpeg'
    file_size INTEGER,  -- Size in bytes for validation/display
    uploaded_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );

-- Indexes for Performance: Speed up queries on foreign keys and common filters.
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notes_parent_id ON notes(parent_id);
CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id);

-- Triggers for Auto-Update of updated_at: Ensures timestamps are current on modifications.
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
AFTER UPDATE ON projects
                            FOR EACH ROW
BEGIN
UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
                            FOR EACH ROW
BEGIN
UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
AFTER UPDATE ON tasks
                            FOR EACH ROW
BEGIN
UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_notes_updated_at
AFTER UPDATE ON notes
                            FOR EACH ROW
BEGIN
UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_attachments_updated_at
AFTER UPDATE ON attachments
                            FOR EACH ROW
BEGIN
UPDATE attachments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;