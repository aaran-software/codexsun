const API_BASE = process.env.APP_URL || 'http://localhost:3006';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
  order_position?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface TodoData {
  user_id: number;
  text: string;
  completed: boolean;
  category: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
}

export const formatDateForMySQL = (date: string | null): string | null => {
  if (!date) return null;
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return null;
  return parsedDate.toISOString().split('T')[0]; // Date only (YYYY-MM-DD)
};

export const fetchTodos = async (userId: number): Promise<Todo[]> => {
  const res = await fetch(`${API_BASE}/todos?user_id=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch todos');
  const data = await res.json();
  return data.map((t: any) => ({
    ...t,
    dueDate: t.due_date ? new Date(t.due_date) : null,
    created_at: t.created_at ? new Date(t.created_at) : undefined,
    updated_at: t.updated_at ? new Date(t.updated_at) : undefined,
  }));
};

export const addTodo = async (todoData: TodoData): Promise<void> => {
  const res = await fetch(`${API_BASE}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(todoData),
  });
  if (!res.ok) throw new Error('Failed to add todo');
};

export const toggleTodo = async (id: number, completed: boolean, userId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed, user_id: userId }),
  });
  if (!res.ok) throw new Error('Failed to toggle todo');
};

export const deleteTodo = async (id: number, userId: number): Promise<void> => {
  const res = await fetch(`${API_BASE}/todos/${id}?user_id=${userId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete todo');
};

export const saveEdit = async (id: number, updates: Omit<TodoData, 'completed'>): Promise<void> => {
  const res = await fetch(`${API_BASE}/todos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update todo');
};

export const saveOrder = async (userId: number, order: number[]): Promise<void> => {
  const res = await fetch(`${API_BASE}/todos/order?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ order }),
  });
  if (!res.ok) throw new Error('Failed to save order');
};