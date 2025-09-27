import express from 'express';
import cors from 'cors';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

const pool = mariadb.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'computer.1',
  database: process.env.DB_NAME || 'codexsun_db',
});

// GET /todos
app.get('/todos', async (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - GET /todos hit with user_id: ${req.query.user_id}`);
  const userId = parseInt(req.query.user_id as string);
  if (isNaN(userId)) {
    console.log(`[ERROR] ${new Date().toISOString()} - Invalid user_id: ${req.query.user_id}`);
    return res.status(400).json({ error: 'Invalid user_id' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM todos WHERE user_id = ? ORDER BY order_position ASC', [userId]);
    res.json(rows);
  } catch (err) {
    console.error(`[ERROR] ${new Date().toISOString()} - Failed to fetch todos: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// POST /todos
app.post('/todos', async (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - POST /todos hit with body: ${JSON.stringify(req.body)}`);
  const { user_id, text, completed = false, category, due_date, priority } = req.body;
  if (!user_id || !text || !category || !priority) {
    console.log(`[ERROR] ${new Date().toISOString()} - Missing required fields`);
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO todos (user_id, text, completed, category, due_date, priority, order_position) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, text, completed, category, due_date || null, priority, 0]
    );
    res.status(201).json({ message: 'Todo added', id: result.insertId });
  } catch (err) {
    console.error(`[ERROR] ${new Date().toISOString()} - Failed to add todo: ${err.message}`);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

// PUT /todos/:id
app.put('/todos/:id', async (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - PUT /todos/${req.params.id} hit with body: ${JSON.stringify(req.body)}`);
  const id = parseInt(req.params.id);
  const { user_id, text, completed, category, due_date, priority } = req.body;
  if (!user_id) {
    console.log(`[ERROR] ${new Date().toISOString()} - Missing user_id`);
    return res.status(400).json({ error: 'Missing user_id' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, user_id]);
    if (rows.length === 0) {
      console.log(`[ERROR] ${new Date().toISOString()} - Todo not found for id: ${id}, user_id: ${user_id}`);
      return res.status(404).json({ error: 'Todo not found' });
    }
    await pool.query(
      'UPDATE todos SET text = ?, completed = ?, category = ?, due_date = ?, priority = ? WHERE id = ? AND user_id = ?',
      [text || rows[0].text, completed !== undefined ? completed : rows[0].completed, category || rows[0].category, due_date !== undefined ? due_date : rows[0].due_date, priority || rows[0].priority, id, user_id]
    );
    res.json({ message: 'Todo updated' });
  } catch (err) {
    console.error(`[ERROR] ${new Date().toISOString()} - Failed to update todo: ${err.message}`);
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// DELETE /todos/:id
app.delete('/todos/:id', async (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - DELETE /todos/${req.params.id} hit with user_id: ${req.query.user_id}`);
  const id = parseInt(req.params.id);
  const userId = parseInt(req.query.user_id as string);
  if (isNaN(userId) || isNaN(id)) {
    console.log(`[ERROR] ${new Date().toISOString()} - Invalid id or user_id: id=${id}, user_id=${userId}`);
    return res.status(400).json({ error: 'Invalid id or user_id' });
  }
  try {
    const [rows] = await pool.query('SELECT * FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
    if (rows.length === 0) {
      console.log(`[ERROR] ${new Date().toISOString()} - Todo not found for id: ${id}, user_id: ${userId}`);
      return res.status(404).json({ error: 'Todo not found' });
    }
    await pool.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Todo deleted' });
  } catch (err) {
    console.error(`[ERROR] ${new Date().toISOString()} - Failed to delete todo: ${err.message}`);
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

// POST /todos/order
app.post('/todos/order', async (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - POST /todos/order hit with user_id: ${req.query.user_id}, body: ${JSON.stringify(req.body)}`);
  const userId = parseInt(req.query.user_id as string);
  const { order } = req.body;
  if (isNaN(userId) || !Array.isArray(order)) {
    console.log(`[ERROR] ${new Date().toISOString()} - Invalid user_id or order: user_id=${userId}, order=${JSON.stringify(order)}`);
    return res.status(400).json({ error: 'Invalid user_id or order array' });
  }
  try {
    const [userTodos] = await pool.query('SELECT id FROM todos WHERE user_id = ?', [userId]);
    const validIds = userTodos.map((t: any) => t.id);
    const validOrder = order.filter((id: number) => validIds.includes(id));
    if (validOrder.length === 0) {
      console.log(`[ERROR] ${new Date().toISOString()} - No valid todo IDs in order for user_id: ${userId}`);
      return res.status(400).json({ error: 'No valid todo IDs in order' });
    }
    await pool.query('START TRANSACTION');
    for (let i = 0; i < validOrder.length; i++) {
      await pool.query('UPDATE todos SET order_position = ? WHERE id = ? AND user_id = ?', [i, validOrder[i], userId]);
    }
    await pool.query('COMMIT');
    res.json({ message: 'Order updated' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(`[ERROR] ${new Date().toISOString()} - Failed to save order: ${err.message}`);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

app.listen(port, () => {
  console.log(`[INFO] ${new Date().toISOString()} - Database API running on http://localhost:${port}`);
});