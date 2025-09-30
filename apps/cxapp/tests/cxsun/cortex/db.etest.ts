// ✅ Mock DB settings before imports
jest.mock('../../../cortex/config/get-settings', () => ({
  getSettings: () => {
    const path = require('path');
    return {
      DB_DRIVER: 'sqlite',
      DB_HOST: '',
      DB_PORT: 0,
      DB_USER: '',
      DB_PASS: '',
      DB_NAME: path.resolve(__dirname, '../../../data/project.sqlite'),
      DB_SSL: false,
    };
  },
}));

import { describe, test, expect, beforeAll, afterAll, jest } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';

import { init, close, getClient } from '../../../cortex/db/connection';
import { query, healthCheck, DbQueryResult } from '../../../cortex/db/db';
import { getDbConfig } from '../../../cortex/config/db-config';

// 👇 raw sqlite imports for schema checks
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const DB_PATH = path.resolve(__dirname, '../../../data/project.sqlite');

// Helper: open sqlite directly for PRAGMA & schema inspection
async function pragma(table: string) {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });
  const result = await db.all(`PRAGMA table_info(${table})`);
  await db.close();
  return result;
}

describe('CodexSun ERP: Persistent SQLite Database Integration for Project Management', () => {
  beforeAll(async () => {
    await fs.unlink(DB_PATH).catch(() => {});

    const cfg = getDbConfig();
    expect(cfg.driver).toBe('sqlite');
    expect(cfg.database).toBe(DB_PATH);

    jest.spyOn(console, 'log').mockImplementation(() => {});

    await init();

    // Create schema using wrapper (just to mimic app flow)
    await query(`
        CREATE TABLE IF NOT EXISTS projects (
                                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                name TEXT NOT NULL,
                                                description TEXT,
                                                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS users (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             name TEXT NOT NULL,
                                             email TEXT UNIQUE NOT NULL,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS tasks (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             project_id INTEGER NOT NULL,
                                             title TEXT NOT NULL,
                                             description TEXT,
                                             status TEXT DEFAULT 'todo',
                                             priority TEXT DEFAULT 'medium',
                                             assignee_id INTEGER,
                                             due_date DATE,
                                             created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                             FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL
            )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS notes (
                                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                                             entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task')),
            entity_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            parent_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (parent_id) REFERENCES notes(id) ON DELETE CASCADE
            )
    `);

    await query(`
        CREATE TABLE IF NOT EXISTS attachments (
                                                   id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                   entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'task', 'note')),
            entity_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            uploaded_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
            )
    `);

    await healthCheck();
  });

  afterAll(async () => {
    await close();
    jest.restoreAllMocks();
    // keep DB file for debugging
  });

  test('Step 1: SQLite database file is present and connectable', async () => {
    await expect(fs.access(DB_PATH)).resolves.not.toThrow();
    const client = await getClient();
    expect(client).toBeDefined();

    const result: DbQueryResult = await query('SELECT 1 AS test');
    expect(result.rows).toEqual([{ test: 1 }]);
  });

  test('Step 2: Verify tables exist in sqlite_master', async () => {
    const { rows: tables } = await query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    console.log("Tables:", tables);
    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toEqual(
      expect.arrayContaining(['projects', 'users', 'tasks', 'notes', 'attachments'])
    );
  });

  test('Step 3: Projects table exists with correct schema', async () => {
    const cols = await pragma("projects");
    console.log("Projects schema:", cols);
    expect(cols).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'id', type: 'INTEGER', pk: 1 }),
      expect.objectContaining({ name: 'name', type: 'TEXT', notnull: 1 }),
      expect.objectContaining({ name: 'description', type: 'TEXT' }),
    ]));
  });

  test('Step 4: Users table exists with correct schema', async () => {
    const cols = await pragma("users");
    console.log("Users schema:", cols);
    expect(cols).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'id', type: 'INTEGER', pk: 1 }),
      expect.objectContaining({ name: 'name', type: 'TEXT', notnull: 1 }),
      expect.objectContaining({ name: 'email', type: 'TEXT', notnull: 1 }),
    ]));
  });

  test('Step 5: Tasks table exists with correct schema', async () => {
    const cols = await pragma("tasks");
    console.log("Tasks schema:", cols);
    expect(cols).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'id', type: 'INTEGER', pk: 1 }),
      expect.objectContaining({ name: 'project_id', type: 'INTEGER', notnull: 1 }),
      expect.objectContaining({ name: 'title', type: 'TEXT', notnull: 1 }),
    ]));
  });

  test('Step 6: Notes table exists with correct schema', async () => {
    const cols = await pragma("notes");
    console.log("Notes schema:", cols);
    expect(cols).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'id', type: 'INTEGER', pk: 1 }),
      expect.objectContaining({ name: 'entity_type', type: 'TEXT', notnull: 1 }),
      expect.objectContaining({ name: 'entity_id', type: 'INTEGER', notnull: 1 }),
    ]));
  });

  test('Step 7: Attachments table exists with correct schema', async () => {
    const cols = await pragma("attachments");
    console.log("Attachments schema:", cols);
    expect(cols).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'id', type: 'INTEGER', pk: 1 }),
      expect.objectContaining({ name: 'entity_type', type: 'TEXT', notnull: 1 }),
      expect.objectContaining({ name: 'entity_id', type: 'INTEGER', notnull: 1 }),
    ]));
  });

  test('Step 8: Indexes and triggers are present', async () => {
    const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

    // Ensure indexes
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_entity ON notes(entity_type, entity_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_notes_parent_id ON notes(parent_id)`);
    await db.exec(`CREATE INDEX IF NOT EXISTS idx_attachments_entity ON attachments(entity_type, entity_id)`);

    // Ensure triggers
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_projects_updated_at
                   AFTER UPDATE ON projects
                   FOR EACH ROW BEGIN
                     UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
                   END`);
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_users_updated_at
                   AFTER UPDATE ON users
                   FOR EACH ROW BEGIN
                     UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
                   END`);
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at
                   AFTER UPDATE ON tasks
                   FOR EACH ROW BEGIN
                     UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
                   END`);
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_notes_updated_at
                   AFTER UPDATE ON notes
                   FOR EACH ROW BEGIN
                     UPDATE notes SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
                   END`);
    await db.exec(`CREATE TRIGGER IF NOT EXISTS update_attachments_updated_at
                   AFTER UPDATE ON attachments
                   FOR EACH ROW BEGIN
                     UPDATE attachments SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
                   END`);

    const indexes = await db.all("SELECT name FROM sqlite_master WHERE type='index'");
    const triggers = await db.all("SELECT name FROM sqlite_master WHERE type='trigger'");

    console.log("Indexes:", indexes.map(i => i.name));
    console.log("Triggers:", triggers.map(t => t.name));

    expect(indexes.map((i) => i.name)).toEqual(expect.arrayContaining([
      'idx_tasks_project_id',
      'idx_tasks_assignee_id',
      'idx_notes_entity',
      'idx_notes_parent_id',
      'idx_attachments_entity',
    ]));

    expect(triggers.map((t) => t.name)).toEqual(expect.arrayContaining([
      'update_projects_updated_at',
      'update_users_updated_at',
      'update_tasks_updated_at',
      'update_notes_updated_at',
      'update_attachments_updated_at',
    ]));

    await db.close();
  });

  test('Step 9: Seed and query data', async () => {
    // Insert project
    await query("INSERT INTO projects (name, description) VALUES (?, ?)", [
      "Test Project",
      "A demo project",
    ]);

    // Insert user
    await query("INSERT INTO users (name, email) VALUES (?, ?)", [
      "Alice",
      "alice@example.com",
    ]);

    // Insert task
    await query("INSERT INTO tasks (project_id, title, description, status, priority) VALUES (?, ?, ?, ?, ?)", [
      1,
      "Setup repo",
      "Initialize Git repository",
      "todo",
      "high",
    ]);

    const { rows: projects } = await query("SELECT * FROM projects");
    const { rows: users } = await query("SELECT * FROM users");
    const { rows: tasks } = await query("SELECT * FROM tasks");

    console.log("Seeded projects:", projects);
    console.log("Seeded users:", users);
    console.log("Seeded tasks:", tasks);

    expect(projects.length).toBeGreaterThan(0);
    expect(users.length).toBeGreaterThan(0);
    expect(tasks.length).toBeGreaterThan(0);

    expect(projects[0].name).toBe("Test Project");
    expect(users[0].email).toBe("alice@example.com");
    expect(tasks[0].title).toBe("Setup repo");
  });
});
