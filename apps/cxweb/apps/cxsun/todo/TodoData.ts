import { Briefcase, User, Layers } from 'lucide-react';

// Defines the structure of a Todo item for backend and frontend.
export interface Todo {
    id?: number; // Optional for creation, set by database
    text: string;
    completed: boolean;
    category: string;
    due_date: string | null; // ISO string or null for database
    priority: 'low' | 'medium' | 'high';
    tenant_id: string; // Required for backend, ignored in local
    created_at?: string; // Set by database, ignored in local
    position?: number; // Position for ordering, updated on drag-drop
}

// Defines the state for editing or deleting a todo item.
export interface InteractionState {
    mode: 'none' | 'edit' | 'delete';
    id: number | null;
    editText: string;
    editCategory: string;
    editDueDate: string; // Date as string for input type="date"
    editPriority: 'low' | 'medium' | 'high';
}

// Defines the state for the add form, separate from edit/delete state.
export interface AddState {
    addText: string;
    addCategory: string;
    addDueDate: string; // Date as string for input type="date"
    addPriority: 'low' | 'medium' | 'high';
}

export const categories = ['Work', 'Personal', 'Other'];
export const priorities = ['low', 'medium', 'high'];

// Map categories to icons for UI display.
export const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    Work: Briefcase,
    Personal: User,
    Other: Layers,
};

// Format date for display in the UI.
export const formatDate = (date: string | null): string => {
    if (!date) return 'No due date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};