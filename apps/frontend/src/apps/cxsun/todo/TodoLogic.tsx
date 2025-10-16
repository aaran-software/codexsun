// TodoLogic.tsx - Use headers from useAuth, define baseUrl for CRUD
import { useState, useEffect } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { Todo, InteractionState, AddState, categories } from './TodoData';
import { useAuth } from '@/global/auth/useAuth';
import { Loader } from '@/components/loader/loader';

// Utility to update todo positions for drag-and-drop ordering.
const updatePositions = (todos: Todo[]): Todo[] => {
    return todos.map((todo, index) => ({
        ...todo,
        position: index + 1,
    }));
};

// Normalize todo data from API (completed 0/1 to boolean, category fallback)
const normalizeTodo = (todo: any): Todo => ({
    ...todo,
    completed: !!todo.completed,
    category: categories.includes(todo.category) ? todo.category : 'Other',
});

export const useTodoLogic = () => {
    const { token, user, API_URL, loading: authLoading, headers } = useAuth(); // Use headers from useAuth
    const baseUrl = `${API_URL}/api/todos`; // Base URL for all todo CRUD operations
    const [todos, setTodos] = useState<Todo[]>([]);
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
    const [addState, setAddState] = useState<AddState>({
        addText: '',
        addCategory: 'Work',
        addDueDate: '',
        addPriority: 'low',
    });
    const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
    const [overId, setOverId] = useState<number | null>(null);
    const [todoListKey, setTodoListKey] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Function to refresh token, assuming AuthContext handles refresh or login.
    const refreshToken = async () => {
        try {
            const res = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: headers(),
            });
            if (res.ok) {
                const data = await res.json();
                return data.token;
            } else {
                setError('Token refresh failed');
                console.error('Token refresh failed:', res.statusText);
                return null;
            }
        } catch (error) {
            setError('Network error during token refresh');
            console.error('Error refreshing token:', error);
            return null;
        }
    };

    // Fetch todos when token is available and not loading.
    useEffect(() => {
        const fetchTodos = async () => {
            if (authLoading || !token || !user?.tenantId) return;

            try {
                let res = await fetch(baseUrl, {
                    headers: headers(),
                });
                if (res.status === 401) {
                    const newToken = await refreshToken();
                    if (!newToken) {
                        setError('Authentication failed');
                        return;
                    }
                    res = await fetch(baseUrl, {
                        headers: headers(),
                    });
                }
                if (res.ok) {
                    const data = await res.json();
                    const normalizedTodos = data.todos.map(normalizeTodo);
                    setTodos(normalizedTodos.sort((a: Todo, b: Todo) => (a.position ?? Infinity) - (b.position ?? Infinity)));
                    setError(null);
                } else {
                    setError('Failed to fetch todos');
                    console.error('Fetch todos failed:', res.statusText);
                }
            } catch (error) {
                setError('Network error while fetching todos');
                console.error('Error fetching todos:', error);
            }
        };

        fetchTodos();
    }, [token, authLoading, user?.tenantId]);

    // Filter todos based on status and category.
    const filteredTodos = todos
        .filter((todo) => {
            if (filter === 'completed') return todo.completed;
            if (filter === 'active') return !todo.completed;
            return true;
        })
        .filter((todo) => categoryFilter === 'all' || todo.category === categoryFilter);

    // Pagination calculations
    const pageCount = Math.ceil(filteredTodos.length / pageSize);
    const paginatedTodos = filteredTodos.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    // Add a new todo using addState
    const addTodo = async () => {
        if (!addState.addText.trim()) {
            setError('Todo text cannot be empty');
            return;
        }
        if (!token || !user?.tenantId) {
            setError('Authentication required');
            return;
        }

        const newTodo = {
            text: addState.addText,
            category: addState.addCategory,
            due_date: addState.addDueDate || null,
            priority: addState.addPriority,
            tenant_id: user.tenantId,
            completed: false,
        };

        try {
            let res = await fetch(baseUrl, {
                method: 'POST',
                headers: headers(),
                body: JSON.stringify(newTodo),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(baseUrl, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify(newTodo),
                });
            }
            if (res.ok) {
                const data = await res.json();
                const normalizedData = normalizeTodo(data);
                setTodos((prev) => updatePositions([...prev, normalizedData]));
                setTodoListKey((prev) => prev + 1);
                setError(null);
                setAddState({ // Reset add form
                    addText: '',
                    addCategory: 'Work',
                    addDueDate: '',
                    addPriority: 'low',
                });
            } else {
                setError('Failed to add todo');
                console.error('Add todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while adding todo');
            console.error('Error adding todo:', error);
        }
    };

    // Toggle todo completion status
    const toggleTodo = async (id: number) => {
        if (!token) {
            setError('Authentication required');
            return;
        }

        try {
            let res = await fetch(`${baseUrl}/${id}/toggle`, {
                method: 'PATCH',
                headers: headers(),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(`${baseUrl}/${id}/toggle`, {
                    method: 'PATCH',
                    headers: headers(),
                });
            }
            if (res.ok) {
                const data = await res.json(); // Assuming toggle returns the updated todo
                const normalizedData = normalizeTodo(data);
                setTodos((prev) =>
                    prev.map((todo) =>
                        todo.id === id ? normalizedData : todo
                    )
                );
                setError(null);
            } else {
                setError('Failed to toggle todo');
                console.error('Toggle todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while toggling todo');
            console.error('Error toggling todo:', error);
        }
    };

    // Delete a todo
    const deleteTodo = async (id: number) => {
        if (!token) {
            setError('Authentication required');
            return;
        }

        try {
            let res = await fetch(`${baseUrl}/${id}`, {
                method: 'DELETE',
                headers: headers(),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(`${baseUrl}/${id}`, {
                    method: 'DELETE',
                    headers: headers(),
                });
            }
            if (res.ok) {
                setTodos((prev) => updatePositions(prev.filter((todo) => todo.id !== id)));
                setTodoListKey((prev) => prev + 1);
                setError(null);
            } else {
                setError('Failed to delete todo');
                console.error('Delete todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while deleting todo');
            console.error('Error deleting todo:', error);
        }
    };

    // Start editing a todo
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

    // Save edited todo
    const saveEdit = async (id: number) => {
        if (!interactionState.editText.trim()) {
            setError('Todo text cannot be empty');
            return;
        }
        if (!token) {
            setError('Authentication required');
            return;
        }

        const updates = {
            text: interactionState.editText,
            category: interactionState.editCategory,
            due_date: interactionState.editDueDate || null,
            priority: interactionState.editPriority,
        };

        try {
            let res = await fetch(`${baseUrl}/${id}`, {
                method: 'PUT',
                headers: headers(),
                body: JSON.stringify(updates),
            });
            if (res.status === 401) {
                const newToken = await refreshToken();
                if (!newToken) {
                    setError('Authentication failed');
                    return;
                }
                res = await fetch(`${baseUrl}/${id}`, {
                    method: 'PUT',
                    headers: headers(),
                    body: JSON.stringify(updates),
                });
            }
            if (res.ok) {
                const data = await res.json();
                const normalizedData = normalizeTodo(data);
                setTodos((prev) =>
                    prev.map((todo) => (todo.id === id ? normalizedData : todo))
                );
                setError(null);
            } else {
                setError('Failed to update todo');
                console.error('Update todo failed:', res.statusText);
            }
        } catch (error) {
            setError('Network error while updating todo');
            console.error('Error updating todo:', error);
        }

        setInteractionState({
            mode: 'none',
            id: null,
            editText: '',
            editCategory: 'Work',
            editDueDate: '',
            editPriority: 'low',
        });
    };

    // Cancel edit or delete action
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

    // Handle drag-and-drop events
    const handleDragStart = (event: DragEndEvent) => {
        const { active } = event;
        const todo = todos.find((t) => t.id === active.id);
        setActiveTodo(todo || null);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { over } = event;
        setOverId(over ? Number(over.id) : null);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && token) {
            const oldIndex = todos.findIndex((todo) => todo.id === active.id);
            const newIndex = todos.findIndex((todo) => todo.id === over.id);
            const reorderedTodos = arrayMove(todos, oldIndex, newIndex);
            const orderedIds = reorderedTodos.map((t) => t.id!);

            try {
                let res = await fetch(`${baseUrl}/order`, {
                    method: 'POST',
                    headers: headers(),
                    body: JSON.stringify({ orderedIds }),
                });
                if (res.status === 401) {
                    const newToken = await refreshToken();
                    if (!newToken) {
                        setError('Authentication failed');
                        return;
                    }
                    res = await fetch(`${baseUrl}/order`, {
                        method: 'POST',
                        headers: headers(),
                        body: JSON.stringify({ orderedIds }),
                    });
                }
                if (res.ok) {
                    setTodos(updatePositions(reorderedTodos));
                    setTodoListKey((prev) => prev + 1);
                    setError(null);
                } else {
                    setError('Failed to update todo order');
                    console.error('Update order failed:', res.statusText);
                }
            } catch (error) {
                setError('Network error while updating todo order');
                console.error('Error updating order:', error);
            }
        }
        setActiveTodo(null);
        setOverId(null);
    };


    return {
        todos,
        filteredTodos,
        paginatedTodos,
        pageIndex,
        setPageIndex,
        pageSize,
        setPageSize,
        pageCount,
        filter,
        setFilter,
        categoryFilter,
        setCategoryFilter,
        interactionState,
        setInteractionState,
        addState,
        setAddState,
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
        error,
        loading: authLoading || Loader, // If Loader is global loading
    };
};