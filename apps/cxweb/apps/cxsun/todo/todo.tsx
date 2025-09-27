// apps/cxsun/react/todo/todo.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '../../../resources/components/ui/button';
import { Input } from '../../../resources/components/ui/input';
import { Checkbox } from '../../../resources/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../resources/components/ui/select';
import { cn } from '../../../resources/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Briefcase, User, Layers, Pencil, Trash2, Check, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useAuth } from '../../../resources/global/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  category: string;
  dueDate: Date | null;
  priority: 'low' | 'medium' | 'high';
}

interface InteractionState {
  mode: 'none' | 'edit' | 'delete';
  id: number | null;
  editText: string;
  editCategory: string;
  editDueDate: string; // Date as string for input type="date"
  editPriority: 'low' | 'medium' | 'high';
}

const categories = ['Work', 'Personal', 'Other'];
const priorities = ['low', 'medium', 'high'];

// Map categories to icons
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Work: Briefcase,
  Personal: User,
  Other: Layers,
};

// Format date for display
const formatDate = (date: Date | null): string => {
  if (!date) return 'No due date';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateForMySQL = (date: string | null): string | null => {
  if (!date) return null;
  // Convert to YYYY-MM-DD format
  return new Date(date).toISOString().split('T')[0];
};

const API_BASE = 'http://localhost:3006';

const SortableTodoItem: React.FC<{
  todo: Todo;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  startEditing: (id: number, text: string, category: string, dueDate: Date | null, priority: 'low' | 'medium' | 'high') => void;
  interactionState: InteractionState;
  setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
  saveEdit: (id: number) => void;
  cancelAction: () => void;
  overId: number | null;
}> = ({
  todo,
  toggleTodo,
  deleteTodo,
  startEditing,
  interactionState,
  setInteractionState,
  saveEdit,
  cancelAction,
  overId,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  const isOver = overId === todo.id && !isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : 'none',
  };

  const CategoryIcon = categoryIcons[todo.category] || Layers;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(todo.id);
    }
  };

  const handleDoubleClick = () => {
    if (interactionState.mode !== 'edit') {
      startEditing(todo.id, todo.text, todo.category, todo.dueDate, todo.priority);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center p-4 bg-white rounded-md shadow-sm',
        todo.completed && 'opacity-75',
        isDragging && 'opacity-30',
        isOver && 'bg-gray-100'
      )}
      onDoubleClick={handleDoubleClick}
    >
      <GripVertical
        className="w-5 h-5 text-gray-400 mr-2 cursor-move"
        {...attributes}
        {...listeners}
      />
      <span className="w-8 text-gray-500 font-medium">{todo.id}.</span>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => toggleTodo(todo.id)}
        className="mr-3"
        onClick={(e) => e.stopPropagation()}
      />
      {interactionState.mode === 'edit' && interactionState.id === todo.id ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={interactionState.editText}
            onChange={(e) => setInteractionState((prev) => ({ ...prev, editText: e.target.value }))}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
          />
          <Select
            value={interactionState.editCategory}
            onValueChange={(value) => setInteractionState((prev) => ({ ...prev, editCategory: value }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={interactionState.editDueDate}
            onChange={(e) => setInteractionState((prev) => ({ ...prev, editDueDate: e.target.value }))}
            className="w-40"
          />
          <Select
            value={interactionState.editPriority}
            onValueChange={(value) => setInteractionState((prev) => ({ ...prev, editPriority: value as 'low' | 'medium' | 'high' }))}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((pri) => (
                <SelectItem key={pri} value={pri}>
                  {pri.charAt(0).toUpperCase() + pri.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => saveEdit(todo.id)}>
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={cancelAction}>
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-2">
          <span
            className={cn(
              'flex-1 flex items-center gap-2',
              todo.completed && 'line-through text-gray-500'
            )}
          >
            {todo.text}{' '}
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <CategoryIcon className="w-4 h-4" />
              {todo.category}
            </span>
          </span>
          <span className="flex items-center gap-2 border-l border-gray-300 pl-2"/>
          <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
            <span
              className={cn('text-sm', todo.completed ? 'text-gray-500' : 'text-gray-600')}
            >
              {formatDate(todo.dueDate)}
            </span>
            <span
              className={cn(
                'text-sm capitalize ',
                todo.priority === 'low' && 'text-green-600',
                todo.priority === 'medium' && 'text-yellow-600',
                todo.priority === 'high' && 'text-red-600',
                todo.completed && 'text-gray-500'
              )}
            >
              {todo.priority}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startEditing(todo.id, todo.text, todo.category, todo.dueDate, todo.priority)}
            className="text-gray-500 hover:text-yellow-600"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTodo(todo.id)}
            className="text-gray-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </li>
  );
};

export default function TodoPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [text, setText] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [interactionState, setInteractionState] = useState<InteractionState>({
    mode: 'none',
    id: null,
    editText: '',
    editCategory: '',
    editDueDate: '',
    editPriority: 'medium',
  });
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [todoListKey, setTodoListKey] = useState(0); // To force re-render if needed

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const fetchTodos = async () => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/todos?user_id=${user.id}`);
if (!res.ok) throw new Error('Failed to fetch todos');
const data = await res.json();
setTodos(data.map((t: any) => ({
  ...t,
  dueDate: t.due_date ? new Date(t.due_date) : null,
})));
} catch (err) {
  console.error('Failed to fetch todos', err);
} finally {
  setLoading(false);
}
};

useEffect(() => {
  fetchTodos();
}, [user, navigate]);

const addTodo = async () => {
  if (!text.trim() || !user?.id) return;
  try {
    const todoData = {
      user_id: user.id,
      text,
      completed: false,
      category,
      due_date: formatDateForMySQL(dueDate),
      priority,
    };
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData),
    });
    if (!res.ok) throw new Error('Failed to add todo');
    setText('');
    setCategory(categories[0]);
    setDueDate('');
    setPriority('medium');
    await fetchTodos();
  } catch (err) {
    console.error('Error adding todo', err);
  }
};

const toggleTodo = async (id: number) => {
  const todo = todos.find((t) => t.id === id);
  if (!todo || !user?.id) return;
  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed, user_id: user.id }),
    });
    if (!res.ok) throw new Error('Failed to toggle todo');
    await fetchTodos();
  } catch (err) {
    console.error('Error toggling todo', err);
  }
};

const deleteTodo = async (id: number) => {
  if (!user?.id) return;
  try {
    const res = await fetch(`${API_BASE}/todos/${id}?user_id=${user.id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete todo');
    await fetchTodos();
  } catch (err) {
    console.error('Error deleting todo', err);
  }
};

const startEditing = (id: number, text: string, category: string, dueDate: Date | null, priority: 'low' | 'medium' | 'high') => {
  setInteractionState({
    mode: 'edit',
    id,
    editText: text,
    editCategory: category,
    editDueDate: dueDate ? dueDate.toISOString().split('T')[0] : '',
    editPriority: priority,
  });
};

const saveEdit = async (id: number) => {
  if (!user?.id || interactionState.mode !== 'edit' || interactionState.id !== id) return;
  try {
    const updates = {
      text: interactionState.editText,
      category: interactionState.editCategory,
      due_date: formatDateForMySQL(interactionState.editDueDate),
      priority: interactionState.editPriority,
      user_id: user.id,
    };
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update todo');
    await fetchTodos();
    setInteractionState({ mode: 'none', id: null, editText: '', editCategory: '', editDueDate: '', editPriority: 'medium' });
  } catch (err) {
    console.error('Error updating todo', err);
  }
};

const cancelAction = () => {
  setInteractionState({ mode: 'none', id: null, editText: '', editCategory: '', editDueDate: '', editPriority: 'medium' });
};

const handleDragStart = (event: any) => {
  const todo = todos.find((t) => t.id === event.active.id);
  setActiveTodo(todo || null);
};

const handleDragOver = (event: DragOverEvent) => {
  setOverId(event.over ? Number(event.over.id) : null);
};

const handleDragEnd = async (event: DragEndEvent) => {
  setActiveTodo(null);
  setOverId(null);
  if (!event.over) return;
  const oldIndex = todos.findIndex((t) => t.id === event.active.id);
  const newIndex = todos.findIndex((t) => t.id === event.over.id);
  if (oldIndex === newIndex) return;
  const newTodos = arrayMove(todos, oldIndex, newIndex);
  setTodos(newTodos);
  try {
    await fetch(`${API_BASE}/todos/order?user_id=${user.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order: newTodos.map(t => t.id) }),
    });
  } catch (err) {
    console.error('Failed to save order', err);
  }
};

const filteredTodos = todos.filter((todo) => {
  if (filter === 'active') return !todo.completed;
  if (filter === 'completed') return todo.completed;
  return true;
});

if (loading) {
  return <div className="flex justify-center items-center h-screen">Loading...</div>;
}

return (
  <div>
    <div className="flex gap-2 mb-6">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1"
      />
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-40"
      />
      <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {priorities.map((pri) => (
            <SelectItem key={pri} value={pri}>
              {pri.charAt(0).toUpperCase() + pri.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={addTodo}>Add</Button>
    </div>
    <motion.div
      className="flex gap-4 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
        All
      </Button>
      <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>
        Active
      </Button>
      <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>
        Completed
      </Button>
    </motion.div>
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={filteredTodos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2" key={todoListKey}>
          {filteredTodos.length === 0 ? (
            <p className="text-center text-gray-500 italic">
              {filter === 'all' ? 'No todos yet.' : `No ${filter} todos.`}
            </p>
          ) : (
            filteredTodos.map((todo) => (
              <SortableTodoItem
                key={`${todo.id}-${todoListKey}`}
                todo={todo}
                toggleTodo={toggleTodo}
                deleteTodo={deleteTodo}
                startEditing={startEditing}
                interactionState={interactionState}
                setInteractionState={setInteractionState}
                saveEdit={saveEdit}
                cancelAction={cancelAction}
                overId={overId}
              />
            ))
          )}
        </ul>
      </SortableContext>
      <DragOverlay>
        {activeTodo ? (
          <div
            className={cn(
              'flex items-center p-4 bg-white rounded-md shadow-lg scale-105',
              activeTodo.completed && 'opacity-75'
            )}
          >
            <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
            <span className="w-8 text-gray-500 font-medium">{activeTodo.id}.</span>
            <Checkbox
              checked={activeTodo.completed}
              disabled
              className="mr-3"
            />
            <div className="flex-1 flex items-center gap-2">
                <span
                  className={cn(
                    'flex-1 flex items-center gap-2',
                    activeTodo.completed && 'line-through text-gray-500'
                  )}
                >
                  {activeTodo.text}{' '}
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    {(() => {
                      const Icon = categoryIcons[activeTodo.category] || Layers;
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {activeTodo.category}
                  </span>
                </span>
              <span className="flex items-center gap-2 border-l border-gray-300 pl-2"/>
              <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
                  <span
                    className={cn('text-sm', activeTodo.completed ? 'text-gray-500' : 'text-gray-600')}
                  >
                    {formatDate(activeTodo.dueDate)}
                  </span>
                <span
                  className={cn(
                    'text-sm capitalize ',
                    activeTodo.priority === 'low' && 'text-green-600',
                    activeTodo.priority === 'medium' && 'text-yellow-600',
                    activeTodo.priority === 'high' && 'text-red-600',
                    activeTodo.completed && 'text-gray-500'
                  )}
                >
                    {activeTodo.priority}
                  </span>
              </div>
              <Button variant="ghost" size="icon" disabled className="text-gray-500">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  </div>
);
};