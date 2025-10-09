// import { Router } from 'express';
// import { authenticateJWT } from '../api/api-auth';
// import { UserController } from './user.controller';
//
// export function createUserRouter(): Router {
//     const router = Router();
//
//     // Apply JWT middleware to all routes
//     router.use(authenticateJWT);
//
//     router.post('/', UserController.create);
//     router.get('/', UserController.getAll);
//     router.get('/:id', UserController.getById);
//     router.put('/:id', UserController.update);
//     router.delete('/:id', UserController.delete);
//
//     return router;
// }