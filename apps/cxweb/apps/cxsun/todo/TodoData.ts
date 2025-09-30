import { Briefcase, User, Layers } from 'lucide-react';

export interface Todo {
  id?: number; // Optional for creation, set by database
  text: string;
  completed: boolean;
  category: string;
  due_date: string | null; // ISO string or null for database
  priority: 'low' | 'medium' | 'high';
  tenant_id: string; // Required for backend, but ignored in local
  created_at?: string; // Set by database, ignored in local
  position?: number; // Position for ordering, updated on drag-drop
}

export interface InteractionState {
  mode: 'none' | 'edit' | 'delete';
  id: number | null;
  editText: string;
  editCategory: string;
  editDueDate: string; // Date as string for input type="date"
  editPriority: 'low' | 'medium' | 'high';
}

export const categories = ['Work', 'Personal', 'Other'];
export const priorities = ['low', 'medium', 'high'];

// Map categories to icons
export const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Work: Briefcase,
  Personal: User,
  Other: Layers,
};

// Format date for display
export const formatDate = (date: string | null): string => {
  if (!date) return 'No due date';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};