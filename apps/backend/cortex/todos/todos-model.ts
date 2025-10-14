// cortex/todos/todos-model.ts
export interface Todo {
    id?: number;
    text: string;
    completed: boolean;
    category: string;
    due_date: string | null;
    priority: 'low' | 'medium' | 'high';
    user_id: string; // Changed from tenant_id to user_id
    created_at?: string;
    updated_at?: string;
    position?: number;
}