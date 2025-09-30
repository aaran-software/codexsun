import React, { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { Todo, InteractionState } from './TodoData';

const API_BASE_URL = 'http://localhost:3000';
const TENANT_ID = 'tenant1';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

const updatePositions = (todos: Todo[]): Todo[] => {
    return todos.map((todo, index) => ({
        ...todo,
        position: index + 1,
    }));
};

export const useTodoLogic = () => {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
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

    const headers = {
        'Content-Type': 'application/json',
        'X-Tenant-Id': TENANT_ID,
        'Authorization': `Bearer ${token}`,
    };

    useEffect(() => {
        const loginAndFetch = async () => {
            if (!token) {
                const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Tenant-Id': TENANT_ID,
                    },
                    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
                });
                if (res.ok) {
                    const data = await res.json();
                    setToken(data.token);
                    localStorage.setItem('token', data.token);
                } else {
                    console.error('Login failed');
                    return;
                }
            }

            if (token) {
                const res = await fetch(`${API_BASE_URL}/api/todos`, {
                    headers: {
                        'X-Tenant-Id': TENANT_ID,
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (res.ok) {
                    const data = await res.json();
                    setTodos(data.sort((a: Todo, b: Todo) => (a.position ?? Infinity) - (b.position ?? Infinity)));
                } else {
                    console.error('Fetch todos failed');
                }
            }
        };

        loginAndFetch();
    }, [token]);

    const filteredTodos = todos
        .filter((todo) => {
            if (filter === 'completed') return todo.completed;
            if (filter === 'active') return !todo.completed;
            return true;
        })
        .filter((todo) => categoryFilter === 'all' || todo.category === categoryFilter);

    const addTodo = () => {
        if (!interactionState.editText.trim() || !token) return;

        const newTodo = {
            text: interactionState.editText,
            category: interactionState.editCategory,
            due_date: interactionState.editDueDate || null,
            priority: interactionState.editPriority,
            tenant_id: TENANT_ID,
            completed: false,
        };

        fetch(`${API_BASE_URL}/api/todos`, {
            method: 'POST',
            headers,
            body: JSON.stringify(newTodo),
        })
            .then((res) => res.json())
            .then((data) => {
                setTodos((prev) => updatePositions([...prev, data]));
                setTodoListKey((prev) => prev + 1);
            })
            .catch((error) => console.error('Add todo failed', error));

        setInteractionState({
            mode: 'none',
            id: null,
            editText: '',
            editCategory: 'Work',
            editDueDate: '',
            editPriority: 'low',
        });
    };

    const toggleTodo = (id: number) => {
        if (!token) return;

        fetch(`${API_BASE_URL}/api/todos/${id}/toggle`, {
            method: 'PATCH',
            headers,
        })
            .then(() => {
                setTodos((prev) =>
                    prev.map((todo) =>
                        todo.id === id ? { ...todo, completed: !todo.completed } : todo
                    )
                );
            })
            .catch((error) => console.error('Toggle todo failed', error));
    };

    const deleteTodo = (id: number) => {
        if (!token) return;

        fetch(`${API_BASE_URL}/api/todos/${id}`, {
            method: 'DELETE',
            headers,
        })
            .then(() => {
                setTodos((prev) => updatePositions(prev.filter((todo) => todo.id !== id)));
                setTodoListKey((prev) => prev + 1);
            })
            .catch((error) => console.error('Delete todo failed', error));
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
        if (!interactionState.editText.trim() || !token) return;

        const updates = {
            text: interactionState.editText,
            category: interactionState.editCategory,
            due_date: interactionState.editDueDate || null,
            priority: interactionState.editPriority,
        };

        fetch(`${API_BASE_URL}/api/todos/${id}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(updates),
        })
            .then((res) => res.json())
            .then((data) => {
                setTodos((prev) =>
                    prev.map((todo) => (todo.id === id ? data : todo))
                );
            })
            .catch((error) => console.error('Update todo failed', error));

        setInteractionState({
            mode: 'none',
            id: null,
            editText: '',
            editCategory: 'Work',
            editDueDate: '',
            editPriority: 'low',
        });
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
        if (over && active.id !== over.id && token) {
            const oldIndex = todos.findIndex((todo) => todo.id === active.id);
            const newIndex = todos.findIndex((todo) => todo.id === over.id);
            const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
            const orderedIds = reorderedTodos.map((t) => t.id!);

            fetch(`${API_BASE_URL}/api/todos/order`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ orderedIds }),
            })
                .then(() => {
                    setTodos(updatePositions(reorderedTodos));
                    setTodoListKey((prev) => prev + 1);
                })
                .catch((error) => console.error('Update order failed', error));
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