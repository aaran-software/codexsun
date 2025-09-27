// apps/cxsun/react/todo/todo.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../resources/global/auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  due_date: string | null; // ISO string or null
  priority: 'low' | 'medium' | 'high';
}

const categories = ['Work', 'Personal', 'Other'];
const priorities = ['low', 'medium', 'high'];

export default function TodoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [text, setText] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [completed, setCompleted] = useState(false);

  // Edit state
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Fetch todos
  const fetchTodos = async () => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    try {
      const res = await fetch(`http://localhost:3006/todos?user_id=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data.map((t: any) => ({
        ...t,
        due_date: t.due_date, // Keep as string/null
      })));
    } catch (err) {
      setError('Failed to fetch todos');
      console.error("Failed to fetch todos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [user, navigate]);

  // Add new todo
  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    try {
      const todoData = {
        user_id: user.id,
        text,
        category,
        dueDate: dueDate || null,
        priority,
        completed,
      };
      const res = await fetch("http://localhost:3006/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(todoData),
      });
      if (!res.ok) throw new Error("Failed to add todo");
      await fetchTodos();
      resetForm();
    } catch (err) {
      setError('Failed to add todo');
      console.error("Error adding todo", err);
    }
  };

  // Delete todo
  const handleDelete = async (id: number) => {
    if (!user?.id) return;
    if (!window.confirm("Are you sure you want to delete this todo?")) return;
    try {
      const res = await fetch(`http://localhost:3006/todos/${id}?user_id=${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      await fetchTodos();
    } catch (err) {
      setError('Failed to delete todo');
      console.error("Error deleting todo", err);
    }
  };

  // Start editing
  const startEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setText(todo.text);
    setCategory(todo.category);
    setDueDate(todo.due_date ? todo.due_date.split('T')[0] : '');
    setPriority(todo.priority);
    setCompleted(todo.completed);
  };

  // Save edit
  const handleUpdateTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo || !user?.id) return;
    try {
      const updates = {
        user_id: user.id,
        text,
        category,
        dueDate: dueDate || null,
        priority,
        completed,
      };
      const res = await fetch(`http://localhost:3006/todos/${editingTodo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      await fetchTodos();
      resetForm();
      setEditingTodo(null);
    } catch (err) {
      setError('Failed to update todo');
      console.error("Error updating todo", err);
    }
  };

  const resetForm = () => {
    setText("");
    setCategory(categories[0]);
    setDueDate("");
    setPriority('medium');
    setCompleted(false);
  };

  const formatDate = (date: string | null): string => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">📝 Todo Management</h2>

      {/* ✅ Add / Edit Form */}
      <form
        onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
        className="space-y-4 mb-6"
      >
        <input
          type="text"
          placeholder="Todo Text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          required
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
          required
        >
          {priorities.map((pri) => (
            <option key={pri} value={pri}>
              {pri.charAt(0).toUpperCase() + pri.slice(1)}
            </option>
          ))}
        </select>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
          />
          <span>Completed</span>
        </label>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
        >
          {editingTodo ? "Update Todo" : "Add Todo"}
        </button>
      </form>

      {/* ✅ Todo Table */}
      {todos.length === 0 ? (
        <p className="text-gray-600">No todos found.</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-2 px-4 text-left">ID</th>
            <th className="py-2 px-4 text-left">Text</th>
            <th className="py-2 px-4 text-left">Completed</th>
            <th className="py-2 px-4 text-left">Category</th>
            <th className="py-2 px-4 text-left">Due Date</th>
            <th className="py-2 px-4 text-left">Priority</th>
            <th className="py-2 px-4 text-center">Actions</th>
          </tr>
          </thead>
          <tbody>
          {todos.map((t) => (
            <tr key={t.id} className="border-t">
              <td className="py-2 px-4">{t.id}</td>
              <td className="py-2 px-4">{t.text}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.completed
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {t.completed ? "Yes" : "No"}
                </span>
              </td>
              <td className="py-2 px-4">{t.category}</td>
              <td className="py-2 px-4">{formatDate(t.due_date)}</td>
              <td className="py-2 px-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.priority === 'low' ? 'bg-green-100 text-green-600' :
                      t.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                  }`}
                >
                  {t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}
                </span>
              </td>
              <td className="py-2 px-4 text-center space-x-2">
                <button
                  onClick={() => startEdit(t)}
                  className="px-3 py-1 text-sm bg-yellow-400 hover:bg-yellow-500 text-white rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
}