import {query} from './cortex/db/db';

interface Todo {
    id: number;
    tenant_id: string;
    title: string;
    completed: boolean;
}

// Main execution
(async () => {
    try {
        const tenantId = 'default'; // Replace with dynamic tenantId in a real application
        const result = await query<Todo>('SELECT * FROM todos WHERE tenant_id = ?', [tenantId], tenantId);
        console.log('Todos:', JSON.stringify(result.rows, null, 2));
        console.log('Query details:', {rowCount: result.rowCount});
    } catch (error) {
        console.error('Error in main execution:', error);
    } finally {
        try {
            await import('./cortex/db/db').then(({ConnectionManager}) => ConnectionManager.closeAll());
        } catch (closeError) {
            console.error('Error closing connections:', closeError);
        }
    }
})();