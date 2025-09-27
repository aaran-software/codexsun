import React from 'react';
import { Button } from '../../../resources/components/ui/button';
import { Input } from '../../../resources/components/ui/input';
import { Checkbox } from '../../../resources/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../resources/components/ui/select';
import { cn } from '../../../resources/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Briefcase, User, Layers, Pencil, Trash2, Check, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { DragOverlay } from '@dnd-kit/core';
import { Pagination } from '../../../resources/components/blocks/Pagination'; // Import the consolidated Pagination component

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
  editDueDate: string;
  editPriority: 'low' | 'medium' | 'high';
}

const categories = ['Work', 'Personal', 'Other'];
const priorities = ['low', 'medium', 'high'];

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Work: Briefcase,
  Personal: User,
  Other: Layers,
};

const formatDate = (date: Date | null): string => {
  if (!date) return 'No due date';
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

interface SortableTodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  startEditing: (id: number, text: string, category: string, dueDate: Date | null, priority: 'low' | 'medium' | 'high') => void;
  interactionState: InteractionState;
  setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
  saveEdit: (id: number) => void;
  cancelAction: () => void;
  overId: number | null;
}

const SortableTodoItem: React.FC<SortableTodoItemProps> = ({
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
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition: isDragging ? transition : undefined,
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
          <span className="border-l border-gray-300 h-6" />
          <div className="flex items-center gap-2">
            <span
              className={cn('text-sm', todo.completed ? 'text-gray-500' : 'text-gray-600')}
            >
              {formatDate(todo.dueDate)}
            </span>
          </div>
          <span className="border-l border-gray-300 h-6" />
          <div className="flex items-center gap-2">
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
          <span className="border-l border-gray-300 h-6" />
          <div className="flex items-center gap-2">
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
        </div>
      )}
    </li>
  );
};

interface TodoUIProps {
  todos: Todo[]; // Now paginated todos
  filter: 'all' | 'active' | 'completed';
  setFilter: (filter: 'all' | 'active' | 'completed') => void;
  text: string;
  setText: (text: string) => void;
  category: string;
  setCategory: (category: string) => void;
  dueDate: string;
  setDueDate: (dueDate: string) => void;
  priority: 'low' | 'medium' | 'high';
  setPriority: (priority: 'low' | 'medium' | 'high') => void;
  addTodo: () => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  startEditing: (id: number, text: string, category: string, dueDate: Date | null, priority: 'low' | 'medium' | 'high') => void;
  interactionState: InteractionState;
  setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
  saveEdit: (id: number) => void;
  cancelAction: () => void;
  activeTodo: Todo | null;
  overId: number | null;
  todoListKey: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TodoUI: React.FC<TodoUIProps> = ({
                                         todos, // paginated
                                         filter,
                                         setFilter,
                                         text,
                                         setText,
                                         category,
                                         setCategory,
                                         dueDate,
                                         setDueDate,
                                         priority,
                                         setPriority,
                                         addTodo,
                                         toggleTodo,
                                         deleteTodo,
                                         startEditing,
                                         interactionState,
                                         setInteractionState,
                                         saveEdit,
                                         cancelAction,
                                         activeTodo,
                                         overId,
                                         todoListKey,
                                         currentPage,
                                         totalPages,
                                         pageSize,
                                         onPageChange,
                                         onPageSizeChange,
                                       }) => {
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
        <Button variant={filter === 'active' ? 'default' : 'outline'} onClick={() => setFilter('active')}>
          Active
        </Button>
        <Button variant={filter === 'completed' ? 'default' : 'outline'} onClick={() => setFilter('completed')}>
          Completed
        </Button>
        <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
          All
        </Button>
      </motion.div>
      <ul className="space-y-2" key={todoListKey}>
        {todos.length === 0 ? (
          <p className="text-center text-gray-500 italic">
            {filter === 'all' ? 'No todos yet.' : `No ${filter} todos.`}
          </p>
        ) : (
          todos.map((todo) => (
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
              <span className="border-l border-gray-300 h-6" />
              <div className="flex items-center gap-2">
                <span
                  className={cn('text-sm', activeTodo.completed ? 'text-gray-500' : 'text-gray-600')}
                >
                  {formatDate(activeTodo.dueDate)}
                </span>
              </div>
              <span className="border-l border-gray-300 h-6" />
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-sm capitalize',
                    activeTodo.priority === 'low' && 'text-green-600',
                    activeTodo.priority === 'medium' && 'text-yellow-600',
                    activeTodo.priority === 'high' && 'text-red-600',
                    activeTodo.completed && 'text-gray-500'
                  )}
                >
                  {activeTodo.priority}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        className="mt-4"
      />
    </div>
  );
};

export default TodoUI;