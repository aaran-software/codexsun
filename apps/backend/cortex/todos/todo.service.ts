// // cortex/todos/todo.service.ts
//
// import * as todoRepo from './todo.repos';
// import { Todo } from './todo.model';
//
// export async function createTodoService(todo: Omit<Todo, 'id' | 'created_at' | 'position' | 'completed'>): Promise<Todo> {
//     const maxPos = await todoRepo.getMaxPosition(todo.tenant_id);
//     const fullTodo: Todo = {
//         ...todo,
//         completed: false,
//         position: maxPos + 1,
//     };
//     const result = await todoRepo.createTodo(fullTodo);
//     const created = await todoRepo.getTodoById(result.insertId!, todo.tenant_id);
//     if (!created) throw new Error('Todo creation failed');
//     return created;
// }
//
// export async function getTodosService(tenantId: string): Promise<Todo[]> {
//     return todoRepo.getTodos(tenantId);
// }
//
// export async function getTodoByIdService(id: number, tenantId: string): Promise<Todo | null> {
//     return todoRepo.getTodoById(id, tenantId);
// }
//
// export async function updateTodoService(id: number, updates: Partial<Todo>, tenantId: string): Promise<Todo | null> {
//     updates.tenant_id = tenantId;
//     const result = await todoRepo.updateTodo(id, updates);
//     if (result.rowCount === 0) return null;
//     return todoRepo.getTodoById(id, tenantId);
// }
//
// export async function deleteTodoService(id: number, tenantId: string): Promise<boolean> {
//     const result = await todoRepo.deleteTodo(id, tenantId);
//     if (result.rowCount === 0) return false;
//     // Update positions after delete
//     const remaining = await todoRepo.getTodos(tenantId);
//     const positions = remaining.map((t, index) => ({ id: t.id!, position: index + 1 }));
//     await todoRepo.updatePositions(tenantId, positions);
//     return true;
// }
//
// export async function updateOrderService(tenantId: string, orderedIds: number[]): Promise<void> {
//     const positions = orderedIds.map((id, index) => ({ id, position: index + 1 }));
//     await todoRepo.updatePositions(tenantId, positions);
// }