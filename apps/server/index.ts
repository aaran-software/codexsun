import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3006; // Changed to avoid conflict with dbApi.ts

app.use(cors());
app.use(express.json());

// In-memory JSON store
let todos = [
  {
    id: 1,
    user_id: 1,
    text: 'Sample Task',
    completed: false,
    category: 'Work',
    due_date: '2025-10-01 10:00:00',
    priority: 'medium',
    order_position: 2,
  },
  {
    id: 2,
    user_id: 1,
    text: 'Task ind afsd fsdf asdf',
    completed: false,
    category: 'Work',
    due_date: '2025-10-01 10:00:00',
    priority: 'medium',
    order_position: 1,
  },
  {
    id: 5,
    user_id: 1,
    text: 'Task1',
    completed: false,
    category: 'Work',
    due_date: '2025-10-01 10:00:00',
    priority: 'medium',
    order_position: 1,
  },
];

// GET /
app.get('/', (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - GET / hit`);
  return res.json('welcome');
});

// GET /todos?user_id=:userId
app.get('/todos', (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - GET /todos hit with user_id: ${req.query.user_id}`);
  const userId = parseInt(req.query.user_id as string);
  if (isNaN(userId)) {
    console.log(`[ERROR] ${new Date().toISOString()} - Invalid user_id: ${req.query.user_id}`);
    return res.status(400).json({ error: 'Invalid user_id' });
  }
  const userTodos = todos.filter((t) => t.user_id === userId).sort((a, b) => a.order_position - b.order_position);
  res.json(userTodos);
});

// POST /todos
app.post('/todos', (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - POST /todos hit with body: ${JSON.stringify(req.body)}`);
  const { user_id, text, completed = false, category, due_date, priority } = req.body;
  if (!user_id || !text || !category || !priority) {
    console.log(`[ERROR] ${new Date().toISOString()} - Missing required fields`);
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const newTodo = {
    id: todos.length > 0 ? Math.max(...todos.map((t) => t.id)) + 1 : 1,
    user_id,
    text,
    completed,
    category,
    due_date: due_date || null,
    priority,
    order_position: todos.filter((t) => t.user_id === user_id).length,
  };
  todos.push(newTodo);
  res.status(201).json({ message: 'Todo added', id: newTodo.id });
});

// PUT /todos/:id
app.put('/todos/:id', (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - PUT /todos/${req.params.id} hit with body: ${JSON.stringify(req.body)}`);
  const id = parseInt(req.params.id);
  const { user_id, text, completed, category, due_date, priority } = req.body;
  if (!user_id) {
    console.log(`[ERROR] ${new Date().toISOString()} - Missing user_id`);
    return res.status(400).json({ error: 'Missing user_id' });
  }
  const todoIndex = todos.findIndex((t) => t.id === id && t.user_id === user_id);
  if (todoIndex === -1) {
    console.log(`[ERROR] ${new Date().toISOString()} - Todo not found for id: ${id}, user_id: ${user_id}`);
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos[todoIndex] = {
    ...todos[todoIndex],
    text: text || todos[todoIndex].text,
    completed: completed !== undefined ? completed : todos[todoIndex].completed,
    category: category || todos[todoIndex].category,
    due_date: due_date !== undefined ? due_date : todos[todoIndex].due_date,
    priority: priority || todos[todoIndex].priority,
  };
  res.json({ message: 'Todo updated' });
});

// DELETE /todos/:id?user_id=:userId
app.delete('/todos/:id', (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - DELETE /todos/${req.params.id} hit with user_id: ${req.query.user_id}`);
  const id = parseInt(req.params.id);
  const userId = parseInt(req.query.user_id as string);
  if (isNaN(userId) || isNaN(id)) {
    console.log(`[ERROR] ${new Date().toISOString()} - Invalid id or user_id: id=${id}, user_id=${userId}`);
    return res.status(400).json({ error: 'Invalid id or user_id' });
  }
  const todoIndex = todos.findIndex((t) => t.id === id && t.user_id === userId);
  if (todoIndex === -1) {
    console.log(`[ERROR] ${new Date().toISOString()} - Todo not found for id: ${id}, user_id: ${userId}`);
    return res.status(404).json({ error: 'Todo not found' });
  }
  todos.splice(todoIndex, 1);
  res.json({ message: 'Todo deleted' });
});

// POST /todos/order?user_id=:userId
app.post('/todos/order', (req, res) => {
  console.log(`[INFO] ${new Date().toISOString()} - POST /todos/order hit with user_id: ${req.query.user_id}, body: ${JSON.stringify(req.body)}`);
  const userId = parseInt(req.query.user_id as string);
  const { order } = req.body;
  if (isNaN(userId) || !Array.isArray(order)) {
    console.log(`[ERROR] ${new Date().toISOString()} - Invalid user_id or order: user_id=${userId}, order=${JSON.stringify(order)}`);
    return res.status(400).json({ error: 'Invalid user_id or order array' });
  }
  const userTodos = todos.filter((t) => t.user_id === userId);
  const otherTodos = todos.filter((t) => t.user_id !== userId);
  const orderedTodos = order
    .map((id: number, index: number) => {
      const todo = userTodos.find((t) => t.id === id);
      if (todo) {
        return { ...todo, order_position: index };
      }
      return null;
    })
    .filter((t) => t !== null);
  todos = [...orderedTodos, ...otherTodos];
  res.json({ message: 'Order updated' });
});

app.listen(port, () => {
  console.log(`[INFO] ${new Date().toISOString()} - Dummy API running on http://localhost:${port}`);
});