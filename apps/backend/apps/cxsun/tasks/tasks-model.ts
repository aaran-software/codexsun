// cortex/tasks/tasks-model.ts
export interface Task {
    id?: number;
    description: string;
    status: 'pending' | 'in_progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    due_date: string | null;
    created_by: string;
    assigned_to: string;
    customer_id: number;
    completed_at?: string | null;
    created_at?: string;
    updated_at?: string;
    position?: number;
}