import React, { useState, useEffect } from 'react';
import { Todo, InteractionState } from './TodoData';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';

export const useTodoLogic = () => {
  const dummyTodos: Todo[] = [
    {
      id: 1,
      text: 'Complete ERP module implementation',
      completed: false,
      category: 'Work',
      due_date: '2025-10-05',
      priority: 'high',
      tenant_id: 'tenant1',
    },
    {
      id: 2,
      text: 'Review financial reports',
      completed: true,
      category: 'Work',
      due_date: null,
      priority: 'medium',
      tenant_id: 'tenant1',
    },
    {
      id: 3,
      text: 'Schedule team meeting',
      completed: false,
      category: 'Personal',
      due_date: '2025-10-10',
      priority: 'low',
      tenant_id: 'tenant1',
    },
    {
      id: 4,
      text: 'Update inventory database',
      completed: false,
      category: 'Other',
      due_date: '2025-10-15',
      priority: 'high',
      tenant_id: 'tenant1',
    },
  ];

  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      return JSON.parse(savedTodos);
    } else {
      return dummyTodos; // Use dummy data if no saved todos
    }
  });
  const [filter, setFilter] = useState<'all' | 'completed' | 'active'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [interactionState, setInteractionState] = useState<InteractionState>({
    mode: 'none',
    id: null,
    editText: '',
    editCategory: 'Work',
    editDueDate: '',
    editPriority: 'low',
  });
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [todoListKey, setTodoListKey] = useState(0);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const filteredTodos = todos.filter((todo) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && todo.completed) ||
      (filter === 'active' && !todo.completed);
    const matchesCategory = categoryFilter === 'all' || todo.category === categoryFilter;
    return matchesFilter && matchesCategory;
  });

  const addTodo = (text: string, category: string, dueDate: string, priority: 'low' | 'medium' | 'high') => {
    if (!text.trim()) return;
    const newTodo: Todo = {
      id: todos.length ? Math.max(...todos.map((t) => t.id!)) + 1 : 1,
      text,
      completed: false,
      category,
      due_date: dueDate || null,
      priority,
      tenant_id: 'tenant1', // Dummy tenant
    };
    setTodos([...todos, newTodo]);
    setTodoListKey((prev) => prev + 1);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    setTodoListKey((prev) => prev + 1);
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    setInteractionState({ ...interactionState, mode: 'none', id: null });
    setTodoListKey((prev) => prev + 1);
  };

  const startEditing = (
    id: number,
    text: string,
    category: string,
    due_date: string | null,
    priority: 'low' | 'medium' | 'high'
  ) => {
    setInteractionState({
      mode: 'edit',
      id,
      editText: text,
      editCategory: category,
      editDueDate: due_date ? new Date(due_date).toISOString().split('T')[0] : '',
      editPriority: priority,
    });
  };

  const saveEdit = (id: number) => {
    if (interactionState.mode !== 'edit' || interactionState.id !== id) return;
    if (!interactionState.editText.trim()) return;

    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? {
              ...todo,
              text: interactionState.editText,
              category: interactionState.editCategory,
              due_date: interactionState.editDueDate ? new Date(interactionState.editDueDate).toISOString() : null,
              priority: interactionState.editPriority,
            }
          : todo
      )
    );
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: 'Work',
      editDueDate: '',
      editPriority: 'low',
    });
    setTodoListKey((prev) => prev + 1);
  };

  const cancelAction = () => {
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: 'Work',
      editDueDate: '',
      editPriority: 'low',
    });
  };

  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event;
    const todo = todos.find((t) => t.id === active.id);
    setActiveTodo(todo || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    setOverId(over ? Number(over.id) : null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = todos.findIndex((todo) => todo.id === active.id);
      const newIndex = todos.findIndex((todo) => todo.id === over.id);
      setTodos(arrayMove(todos, oldIndex, newIndex));
      setTodoListKey((prev) => prev + 1);
    }
    setActiveTodo(null);
    setOverId(null);
  };

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    categoryFilter,
    setCategoryFilter,
    interactionState,
    setInteractionState,
    activeTodo,
    overId,
    todoListKey,
    addTodo,
    toggleTodo,
    deleteTodo,
    startEditing,
    saveEdit,
    cancelAction,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
};