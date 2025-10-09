// // cortex/todos/todo.routes.ts
//
// import {Router} from 'express';
// import {authenticateJWT} from '../api/api-auth';
// import {TodoController} from './todo.controller';
//
// export function createTodoRouter(): Router {
//     const router = Router();
//
//     // Apply JWT middleware to all routes
//     router.use(authenticateJWT);
//
//     router.post('/', TodoController.create);
//     router.get('/', TodoController.getAll);
//     router.get('/:id', TodoController.getById);
//     router.put('/:id', TodoController.update);
//     router.delete('/:id', TodoController.delete);
//     router.post('/order', TodoController.updateOrder);
//     router.patch('/:id/toggle', TodoController.toggleCompleted);
//
//     return router;
// }