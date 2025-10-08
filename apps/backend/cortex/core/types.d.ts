// E:\Workspace\codexsun\apps\backend\cortex\core\types.d.ts

import { Request } from 'express-serve-static-core';
import { RequestContext } from './app.types';

declare module 'express-serve-static-core' {
    interface Request {
        context: RequestContext;
        ip: string;
        version?: string;
    }
}