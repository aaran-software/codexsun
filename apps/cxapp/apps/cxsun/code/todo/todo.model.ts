// apps/cxsun/code/todo/todo.model.ts

export interface Todo {
  id: number;
  user_id: number;
  text: string;
  completed: boolean;
  category: string;
  due_date: Date | null;
  priority: 'low' | 'medium' | 'high';
  order_position: number;
  created_at: Date;
  updated_at: Date;
}
