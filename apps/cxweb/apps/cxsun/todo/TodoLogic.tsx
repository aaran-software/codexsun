import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../resources/global/auth/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import TodoUI from './TodoUI';
import * as TodoData from './TodoData';

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

interface InteractionState {
  mode: 'none' | 'edit' | 'delete';
  id: number | null;
  editText: string;
  editCategory: string;
  editDueDate: string;
  editPriority: 'low' | 'medium' | 'high';
}

const categories = ['Work', 'Personal', 'Other'];
const priorities = ['low', 'medium', 'high'];

export default function TodoLogic() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [allTodos, setAllTodos] = useState<Todo[]>([]);
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
  const [todoListKey, setTodoListKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
      return;
    }
    TodoData.fetchTodos(user.id)
      .then((fetchedTodos) => setAllTodos(fetchedTodos))
      .catch((err) => console.error('Failed to fetch todos', err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const addTodo = async () => {
    if (!text.trim() || !user?.id) return;
    try {
      await TodoData.addTodo({
        user_id: user.id,
        text,
        completed: false,
        category,
        due_date: TodoData.formatDateForMySQL(dueDate),
        priority,
      });
      setText('');
      setCategory(categories[0]);
      setDueDate('');
      setPriority('medium');
      const fetchedTodos = await TodoData.fetchTodos(user.id);
      setAllTodos(fetchedTodos);
      setTodoListKey((prev) => prev + 1);
      // Reset to first page after add
      setCurrentPage(1);
    } catch (err) {
      console.error('Error adding todo', err);
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = allTodos.find((t) => t.id === id);
    if (!todo || !user?.id) return;
    try {
      await TodoData.toggleTodo(id, !todo.completed, user.id);
      const fetchedTodos = await TodoData.fetchTodos(user.id);
      setAllTodos(fetchedTodos);
      setTodoListKey((prev) => prev + 1);
      // Reset to first page if filter changes might affect pages
      setCurrentPage(1);
    } catch (err) {
      console.error('Error toggling todo', err);
    }
  };

  const deleteTodo = async (id: number) => {
    if (!user?.id) return;
    try {
      await TodoData.deleteTodo(id, user.id);
      const fetchedTodos = await TodoData.fetchTodos(user.id);
      setAllTodos(fetchedTodos);
      setTodoListKey((prev) => prev + 1);
      // Adjust page if necessary
      const totalAfterDelete = fetchedTodos.length;
      const newTotalPages = Math.ceil(totalAfterDelete / pageSize);
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
      }
    } catch (err) {
      console.error('Error deleting todo', err);
    }
  };

  const startEditing = (
    id: number,
    text: string,
    category: string,
    dueDate: Date | null,
    priority: 'low' | 'medium' | 'high'
  ) => {
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
      await TodoData.saveEdit(id, {
        text: interactionState.editText,
        category: interactionState.editCategory,
        due_date: TodoData.formatDateForMySQL(interactionState.editDueDate),
        priority: interactionState.editPriority,
        user_id: user.id,
      });
      const fetchedTodos = await TodoData.fetchTodos(user.id);
      setAllTodos(fetchedTodos);
      setTodoListKey((prev) => prev + 1);
      setInteractionState({
        mode: 'none',
        id: null,
        editText: '',
        editCategory: '',
        editDueDate: '',
        editPriority: 'medium',
      });
    } catch (err) {
      console.error('Error updating todo', err);
    }
  };

  const cancelAction = () => {
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: '',
      editDueDate: '',
      editPriority: 'medium',
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const todo = filteredTodos.find((t) => t.id === event.active.id);
    setActiveTodo(todo || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over ? Number(event.over.id) : null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTodo(null);
    setOverId(null);
    if (!event.over || !user?.id) return;
    const overId = event.over.id;
    if (typeof overId !== 'number') return;
    const oldIndex = filteredTodos.findIndex((t) => t.id === event.active.id);
    const newIndex = filteredTodos.findIndex((t) => t.id === overId);
    if (oldIndex === newIndex || oldIndex === -1 || newIndex === -1) return;
    const newFilteredTodos = arrayMove(filteredTodos, oldIndex, newIndex);
    // Update allTodos with the reordered filtered
    const newAllTodos = allTodos.map((t) => {
      const updated = newFilteredTodos.find((u) => u.id === t.id);
      return updated || t;
    });
    setAllTodos(newAllTodos);
    setTodoListKey((prev) => prev + 1);
    try {
      await TodoData.saveOrder(user.id, newFilteredTodos.map((t) => t.id));
    } catch (err) {
      console.error('Failed to save order', err);
    }
  };

  const filteredTodos = allTodos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const totalPages = Math.ceil(filteredTodos.length / pageSize) || 1;
  const paginatedTodos = filteredTodos.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={paginatedTodos.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <TodoUI
          todos={paginatedTodos}
          filter={filter}
          setFilter={setFilter}
          text={text}
          setText={setText}
          category={category}
          setCategory={setCategory}
          dueDate={dueDate}
          setDueDate={setDueDate}
          priority={priority}
          setPriority={setPriority}
          addTodo={addTodo}
          toggleTodo={toggleTodo}
          deleteTodo={deleteTodo}
          startEditing={startEditing}
          interactionState={interactionState}
          setInteractionState={setInteractionState}
          saveEdit={saveEdit}
          cancelAction={cancelAction}
          activeTodo={activeTodo}
          overId={overId}
          todoListKey={todoListKey}
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      </SortableContext>
    </DndContext>
  );
}