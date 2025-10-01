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

// Section 1: Interfaces
// Defines the props for the SortableTodoItem component, which handles individual todo rendering and interactions.
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
    error: string | null;
    loading: boolean;
}

// Section 2: SortableTodoItem Component
// This component renders a single sortable todo item, handling drag-and-drop, editing mode, and actions like toggle, edit, and delete.
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
    // Use sortable hook to enable drag-and-drop functionality for this item.
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: todo.id!,
    });

    const isOver = overId === todo.id && !isDragging;

    // Compute styles for drag transformation and transition.
    const style = {
        transform: CSS.Transform.toString(transform),
        transition: isDragging ? transition : 'none',
    };

    // Get the icon component based on the todo's category.
    const CategoryIcon = categoryIcons[todo.category] || (() => null);

    // Handle key down event for edit input to save on Enter key press.
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveEdit(todo.id!);
        }
    };

    // Conditional rendering: If in edit mode for this todo, show edit form; otherwise, show view mode.
    if (interactionState.mode === 'edit' && interactionState.id === todo.id) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                    'flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2',
                    'hover:shadow-md transition-shadow duration-200'
                )}
            >
                <Input
                    value={interactionState.editText}
                    onChange={(e) =>
                        setInteractionState((prev) => ({ ...prev, editText: e.target.value }))
                    }
                    onKeyDown={handleKeyDown}
                    className="flex-1 mr-2"
                    placeholder="Edit todo..."
                />
                <Select
                    value={interactionState.editCategory}
                    onValueChange={(value) =>
                        setInteractionState((prev) => ({ ...prev, editCategory: value }))
                    }
                >
                    <SelectTrigger className="w-[120px] mr-2">
                        <SelectValue placeholder="Category" />
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
                    onChange={(e) =>
                        setInteractionState((prev) => ({ ...prev, editDueDate: e.target.value }))
                    }
                    className="w-[150px] mr-2"
                />
                <Select
                    value={interactionState.editPriority}
                    onValueChange={(value) =>
                        setInteractionState((prev) => ({ ...prev, editPriority: value as 'low' | 'medium' | 'high' }))
                    }
                >
                    <SelectTrigger className="w-[120px] mr-2">
                        <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                        {['low', 'medium', 'high'].map((pri) => (
                            <SelectItem key={pri} value={pri}>
                                {pri.charAt(0).toUpperCase() + pri.slice(1)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => saveEdit(todo.id!)} className="text-green-600 mr-1">
                    <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={cancelAction} className="text-red-600">
                    <X className="h-4 w-4" />
                </Button>
            </motion.div>
        );
    }

    // View mode rendering for the todo item.
    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...attributes}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={cn(
                'flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2',
                'hover:shadow-md transition-shadow duration-200',
                isDragging && 'opacity-50',
                isOver && 'border-blue-500 shadow-lg',
                todo.completed && 'opacity-75'
            )}
        >
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="w-5 h-5 text-gray-400 mr-2" />
            </div>
            <span className="w-8 text-gray-500 font-medium">{todo.id}.</span>
            <Checkbox
                checked={todo.completed}
                onCheckedChange={() => toggleTodo(todo.id!)}
                className="mr-3"
            />
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
                    <span className={cn('text-sm', todo.completed ? 'text-gray-500' : 'text-gray-600')}>
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
                    onClick={() =>
                        startEditing(
                            todo.id!,
                            todo.text,
                            todo.category,
                            todo.due_date,
                            todo.priority
                        )
                    }
                    className="text-gray-500"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTodo(todo.id!)}
                    className="text-gray-500"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </motion.div>
    );
};

// Section 3: TodoList Component
// This component renders the entire todo list, including filters, add button, and sortable items with drag-and-drop support.
interface TodoListProps {
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
    addTodo: () => void;
    toggleTodo: (id: number) => void;
    deleteTodo: (id: number) => void;
    startEditing: (id: number, text: string, category: string, due_date: string | null, priority: 'low' | 'medium' | 'high') => void;
    saveEdit: (id: number) => void;
    cancelAction: () => void;
    handleDragStart: (event: DragEndEvent) => void;
    handleDragOver: (event: DragOverEvent) => void;
    handleDragEnd: (event: DragEndEvent) => void;
    error: string;
    loading: string;
}

export const TodoList: React.FC<TodoListProps> = ({
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
                                                      error,
                                                      loading,
                                                  }) => {
    // Set up sensors for drag-and-drop (mouse, touch, keyboard).
    const sensors = useSensors(
        useSensor(MouseSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor)
    );

    // Update renderError to include loading state

    const renderError = () => (
        <>
            {loading && (
                <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
                    Loading...
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    {error}
                </div>
            )}
        </>
    );
    // Section 3.1: Add Section
    // Always render the add form as a separate section, keeping it open by default without a toggle button.
    const renderAddSection = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-4"
        >
            <Input
                value={interactionState.editText}
                onChange={(e) =>
                    setInteractionState((prev) => ({ ...prev, editText: e.target.value }))
                }
                className="flex-1 mr-2"
                placeholder="Add new todo..."
            />
            <Select
                value={interactionState.editCategory}
                onValueChange={(value) =>
                    setInteractionState((prev) => ({ ...prev, editCategory: value }))
                }
            >
                <SelectTrigger className="w-[120px] mr-2">
                    <SelectValue placeholder="Category" />
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
                onChange={(e) =>
                    setInteractionState((prev) => ({ ...prev, editDueDate: e.target.value }))
                }
                className="w-[150px] mr-2"
            />
            <Select
                value={interactionState.editPriority}
                onValueChange={(value) =>
                    setInteractionState((prev) => ({ ...prev, editPriority: value as 'low' | 'medium' | 'high' }))
                }
            >
                <SelectTrigger className="w-[120px] mr-2">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                    {['low', 'medium', 'high'].map((pri) => (
                        <SelectItem key={pri} value={pri}>
                            {pri.charAt(0).toUpperCase() + pri.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={addTodo} className="text-green-600 mr-1">
                <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={cancelAction} className="text-red-600">
                <X className="h-4 w-4" />
            </Button>
        </motion.div>
    );

    // Section 3.2: Filters Section
    // Render filter controls for status and category.
    const renderFilters = () => (
        <div className="flex justify-between mb-4">
            <Select value={filter} onValueChange={(value) => setFilter(value as 'all' | 'completed' | 'active')}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                            {cat}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <div>
            {/* Always render the add section, keeping it open and separate as requested. */}
            {renderAddSection()}
            {renderFilters()}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis]}
            >
                <SortableContext
                    key={todoListKey}
                    items={filteredTodos.map((todo) => todo.id!)}
                    strategy={verticalListSortingStrategy}
                >
                    {filteredTodos.map((todo) => (
                        <SortableTodoItem
                            key={todo.id}
                            todo={todo}
                            toggleTodo={toggleTodo}
                            deleteTodo={deleteTodo}
                            startEditing={startEditing}
                            interactionState={interactionState}
                            setInteractionState={setInteractionState}
                            saveEdit={saveEdit}
                            cancelAction={cancelAction}
                            overId={overId} error={null} loading={false}                        />
                    ))}
                </SortableContext>

                <DragOverlay>
                    {activeTodo ? (
                        <div
                            className={cn(
                                'flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm mb-2',
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