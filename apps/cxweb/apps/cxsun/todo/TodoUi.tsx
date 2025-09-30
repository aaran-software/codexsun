import React, {useState} from 'react';
import { Button } from '../../../resources/components/ui/button';
import { Input } from '../../../resources/components/ui/input';
import { Checkbox } from '../../../resources/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../resources/components/ui/select';
import { cn } from '../../../resources/lib/utils';
import { motion } from 'framer-motion';
import { GripVertical, Pencil, Trash2, Check, X } from 'lucide-react';
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
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Todo, InteractionState, categories, categoryIcons, formatDate } from './TodoData';

interface SortableTodoItemProps {
  todo: Todo;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  startEditing: (id: number, text: string, category: string, due_date: string | null, priority: 'low' | 'medium' | 'high') => void;
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
    id: todo.id!,
  });

  const isOver = overId === todo.id && !isDragging;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : 'none',
  };

  const CategoryIcon = categoryIcons[todo.category] || (() => null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log(`Enter key pressed for todo ${todo.id}`);
      saveEdit(todo.id!);
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
        onCheckedChange={() => toggleTodo(todo.id!)}
        className="mr-3"
      />
      {interactionState.mode === 'edit' && interactionState.id === todo.id ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={interactionState.editText}
            onChange={(e) => setInteractionState({ ...interactionState, editText: e.target.value })}
            onKeyDown={handleKeyDown}
            className="flex-1"
            autoFocus
          />
          <Select
            value={interactionState.editCategory}
            onValueChange={(value) => setInteractionState({ ...interactionState, editCategory: value })}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="date"
            value={interactionState.editDueDate}
            onChange={(e) => setInteractionState({ ...interactionState, editDueDate: e.target.value })}
            className="w-40"
          />
          <Select
            value={interactionState.editPriority}
            onValueChange={(value) =>
              setInteractionState({ ...interactionState, editPriority: value as 'low' | 'medium' | 'high' })
            }
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['low', 'medium', 'high'].map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="icon" onClick={() => saveEdit(todo.id!)}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon" onClick={cancelAction}>
            <X className="h-4 w-4 text-red-600" />
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
          <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
            <span
              className={cn('text-sm', todo.completed ? 'text-gray-500' : 'text-gray-600')}
            >
              {formatDate(todo.due_date)}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => startEditing(todo.id!, todo.text, todo.category, todo.due_date, todo.priority)}
          >
            <Pencil className="h-4 w-4  cursor-pointer" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTodo(todo.id!)}
            className="text-gray-500"
          >
            <Trash2 className="h-4 w-4  cursor-pointer" />
          </Button>
        </div>
      )}
    </li>
  );
};

interface TodoUiProps {
  todos: Todo[];
  filteredTodos: Todo[];
  filter: 'all' | 'completed' | 'active';
  setFilter: React.Dispatch<React.SetStateAction<'all' | 'completed' | 'active'>>;
  categoryFilter: string;
  setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  interactionState: InteractionState;
  setInteractionState: React.Dispatch<React.SetStateAction<InteractionState>>;
  activeTodo: Todo | null;
  overId: number | null;
  todoListKey: number;
  addTodo: (text: string, category: string, dueDate: string, priority: 'low' | 'medium' | 'high') => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  startEditing: (id: number, text: string, category: string, due_date: string | null, priority: 'low' | 'medium' | 'high') => void;
  saveEdit: (id: number) => void;
  cancelAction: () => void;
  handleDragStart: (event: DragEndEvent) => void;
  handleDragOver: (event: DragOverEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export const TodoUi: React.FC<TodoUiProps> = ({
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
}) => {
  const [newTodo, setNewTodo] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('low');

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    addTodo(newTodo, newCategory, newDueDate, newPriority);
    setNewTodo('');
    setNewCategory('Work');
    setNewDueDate('');
    setNewPriority('low');
  };

  return (
    <div className="p-6 max-w-9xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">Todos</h1>

      <motion.form
        onSubmit={handleAddTodo}
        className="mb-6 flex flex-col sm:flex-row gap-4 items-end"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Input
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="flex-1"
        />
        <Select value={newCategory} onValueChange={setNewCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={newDueDate}
          onChange={(e) => setNewDueDate(e.target.value)}
          className="w-40"
        />
        <Select value={newPriority} onValueChange={(value) => setNewPriority(value as 'low' | 'medium' | 'high')}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['low', 'medium', 'high'].map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="submit" disabled={!newTodo.trim()}>
          Add Todo
        </Button>
      </motion.form>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'completed' | 'active')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={todos.map((todo) => todo.id!)} strategy={verticalListSortingStrategy}>
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
                      const Icon = categoryIcons[activeTodo.category] || (() => null);
                      return <Icon className="w-4 h-4" />;
                    })()}
                    {activeTodo.category}
                  </span>
                </span>


                <div className="flex items-center gap-2 border-l border-gray-300 pl-2">
                  <span
                    className={cn('text-sm', activeTodo.completed ? 'text-gray-500' : 'text-gray-600')}
                  >
                    {formatDate(activeTodo.due_date)}
                  </span>
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
