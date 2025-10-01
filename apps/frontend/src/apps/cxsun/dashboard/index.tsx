import React, { useState, useEffect } from 'react';
import { Button } from '../../../resources/components/ui/button';
import { Input } from '../../../resources/components/ui/input';
import { Checkbox } from '../../../resources/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../resources/components/ui/select';
import { cn } from '@/components/lib/utils';
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
      console.log(`Enter key pressed for todo ${todo.id}`);
      saveEdit(todo.id);
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
            onChange={(e) =>
              setInteractionState((prev) => ({
                ...prev,
                editText: e.target.value,
              }))
            }
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
          <Select
            value={interactionState.editCategory}
            onValueChange={(value) =>
              setInteractionState((prev) => ({
                ...prev,
                editCategory: value,
              }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => {
                const Icon = categoryIcons[cat] || Layers;
                return (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {cat}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={interactionState.editDueDate}
            onChange={(e) =>
              setInteractionState((prev) => ({
                ...prev,
                editDueDate: e.target.value,
              }))
            }
            className="w-40"
            onClick={(e) => e.stopPropagation()}
          />
          <Select
            value={interactionState.editPriority}
            onValueChange={(value) =>
              setInteractionState((prev) => ({
                ...prev,
                editPriority: value as 'low' | 'medium' | 'high',
              }))
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((pri) => (
                <SelectItem key={pri} value={pri}>
                  {pri.charAt(0).toUpperCase() + pri.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Saving edit for todo ${todo.id}`);
              saveEdit(todo.id);
            }}
            className="text-green-500 hover:text-green-700"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              console.log(`Cancelling edit for todo ${todo.id}`);
              cancelAction();
            }}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex items-center gap-2">
          <span
            className={cn(
              'flex-1 flex items-center gap-2',
              todo.completed && 'line-through text-gray-500'
            )}
            onDoubleClick={(e) => {
              e.stopPropagation();
              console.log(`Double-clicked todo ${todo.id} to edit`);
              startEditing(todo.id, todo.text, todo.category, todo.dueDate, todo.priority);
            }}
          >
            {todo.text}{' '}
            <span className="text-sm text-gray-400 flex items-center gap-1">
              <CategoryIcon className="w-4 h-4" />
              {todo.category}
            </span>
          </span>
          <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
            <span className={cn('text-sm', todo.completed ? 'text-gray-500' : 'text-gray-600')}>
              {formatDate(todo.dueDate)}
            </span>
            <span
              className={cn(
                'text-sm capitalize',
                todo.priority === 'low' && 'text-green-600',
                todo.priority === 'medium' && 'text-yellow-600',
                todo.priority === 'high' && 'text-red-600',
                todo.completed && 'text-gray-500'
              )}
            >
              {todo.priority}
            </span>
          </div>
          {interactionState.mode === 'delete' && interactionState.id === todo.id ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Confirming delete for todo ${todo.id}`);
                  deleteTodo(todo.id);
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Cancelling delete for todo ${todo.id}`);
                  cancelAction();
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Clicked edit for todo ${todo.id}`);
                  startEditing(todo.id, todo.text, todo.category, todo.dueDate, todo.priority);
                }}
                className="text-gray-500 hover:text-blue-500"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(`Clicked delete for todo ${todo.id}`);
                  setInteractionState({
                    mode: 'delete',
                    id: todo.id,
                    editText: '',
                    editCategory: categories[0],
                    editDueDate: '',
                    editPriority: 'low',
                  });
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

let filteredTodos: Todo[] = [];

const DashboardPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure dueDate is converted to Date object
      return parsed.map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
      }));
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [interactionState, setInteractionState] = useState<InteractionState>({
    mode: 'none',
    id: null,
    editText: '',
    editCategory: categories[0],
    editDueDate: '',
    editPriority: 'low',
  });
  const [nextId, setNextId] = useState(() => {
    const saved = localStorage.getItem('nextId');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [todoListKey, setTodoListKey] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
    localStorage.setItem('nextId', nextId.toString());
    setTodoListKey(Date.now());
    console.log('Todos updated:', todos);
  }, [todos, nextId]);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setTodos([
        ...todos,
        {
          id: nextId,
          text: inputValue.trim(),
          completed: false,
          category,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
        },
      ]);
      setInputValue('');
      setCategory(categories[0]);
      setDueDate('');
      setPriority('low');
      setNextId(nextId + 1);
      setInteractionState({
        mode: 'none',
        id: null,
        editText: '',
        editCategory: categories[0],
        editDueDate: '',
        editPriority: 'low',
      });
      console.log(`Added todo with id ${nextId}`);
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: categories[0],
      editDueDate: '',
      editPriority: 'low',
    });
    console.log(`Toggled todo ${id} to completed: ${!todos.find((t) => t.id === id)?.completed}`);
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: categories[0],
      editDueDate: '',
      editPriority: 'low',
    });
    console.log(`Deleted todo ${id}`);
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
    console.log(`Started editing todo ${id}`);
  };

  const saveEdit = (id: number) => {
    if (interactionState.mode === 'edit' && interactionState.id === id && interactionState.editText.trim()) {
      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? {
              ...todo,
              text: interactionState.editText.trim(),
              category: interactionState.editCategory,
              dueDate: interactionState.editDueDate ? new Date(interactionState.editDueDate) : null,
              priority: interactionState.editPriority,
            }
            : todo
        )
      );
      console.log(
        `Saved edit for todo ${id}: text=${interactionState.editText.trim()}, category=${interactionState.editCategory}, dueDate=${interactionState.editDueDate}, priority=${interactionState.editPriority}`
      );
    } else {
      console.log(`Failed to save edit for todo ${id}: invalid state`, interactionState);
    }
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: categories[0],
      editDueDate: '',
      editPriority: 'low',
    });
  };

  const cancelAction = () => {
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: categories[0],
      editDueDate: '',
      editPriority: 'low',
    });
    console.log('Cancelled action');
  };

  const handleDragStart = (event: DragEndEvent) => {
    setActiveId(event.active.id as number);
    setInteractionState({
      mode: 'none',
      id: null,
      editText: '',
      editCategory: categories[0],
      editDueDate: '',
      editPriority: 'low',
    });
    console.log(`Started dragging todo ${event.active.id}`);
  };

  const handleDragOver = (event: DragOverEvent) => {
    setOverId(event.over?.id as number | null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setTodos((todos) => {
        const oldIndex = todos.findIndex((todo) => todo.id === active.id);
        const newIndex = todos.findIndex((todo) => todo.id === over.id);
        console.log(`Reordered todo ${active.id} from index ${oldIndex} to ${newIndex}`);
        return arrayMove(todos, oldIndex, newIndex);
      });
    }
    setActiveId(null);
    setOverId(null);
  };

  filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, {})
  );

  const activeTodo = todos.find((todo) => todo.id === activeId);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <motion.h1
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Todo Dashboard
      </motion.h1>

      <motion.form
        onSubmit={handleAddTodo}
        className="flex gap-2 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-1"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat] || Layers;
              return (
                <SelectItem key={cat} value={cat}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {cat}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-40"
        />
        <Select value={priority} onValueChange={(value) => setPriority(value as 'low' | 'medium' | 'high')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            {priorities.map((pri) => (
              <SelectItem key={pri} value={pri}>
                {pri.charAt(0).toUpperCase() + pri.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit">Add Todo</Button>
      </motion.form>

      <motion.div
        className="flex gap-2 mb-4 justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          onClick={() => setFilter('completed')}
        >
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
        <SortableContext items={todos.map((todo) => todo.id)} strategy={verticalListSortingStrategy}>
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

export default DashboardPage;