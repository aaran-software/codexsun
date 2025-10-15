import { query, ConnectionManager } from './cortex/db/db';

interface Todo {
  id: number;
  text: string;
  completed: number;
  category: string;
  due_date: string;
  priority: string;
  tenant_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// Main execution
(async () => {
  try {
    const tenantId = 'default';
    const result = await query<Todo>('SELECT * FROM todos WHERE tenant_id = ?', [tenantId], tenantId);
    console.log('Todos:', JSON.stringify(result.rows, null, 2));
    console.log('Query details:', { rowCount: result.rowCount });
  } catch (error) {
    console.error('Error in main execution:', error);
  } finally {
    try {
      await ConnectionManager.closeAll();
    } catch (closeError) {
      console.error('Error closing connections:', closeError);
    }
  }
})();
