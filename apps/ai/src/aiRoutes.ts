import http, {IncomingMessage, ServerResponse} from "http";
import type {RouteDef} from '../../../cortex/http/chttpx';
import type {Database} from 'sqlite3';

interface RequestExtras {
    body?: any;
    db?: Database;
}

type Handler = (req: IncomingMessage & RequestExtras, res: ServerResponse) => Promise<void>;

// Manual validation function (no Zod)
function validateDataPoint(body: any): { x: number; y: number } | null {
    if (typeof body !== 'object' || body == null) return null;
    const x = parseFloat(body.x);
    const y = parseFloat(body.y);
    if (isNaN(x) || isNaN(y)) return null;
    return {x, y};
}

export function aiRoutes(): RouteDef[] {
    return [
        {
            method: 'GET',
            path: '/api/ai/data',
            handler: async (req: IncomingMessage & RequestExtras, res: ServerResponse) => {
                try {
                    if (!req.db) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({success: false, error: 'Database not available'}));
                        return;
                    }
                    const rows = await new Promise<any[]>((resolve, reject) => {
                        req.db!.all('SELECT x, y FROM data_points', (err, rows) => {
                            if (err) reject(err);
                            else resolve(rows);
                        });
                    });
                    res.statusCode = 200;
                    res.end(JSON.stringify({success: true, data: rows}));
                } catch (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({success: false, error: 'Failed to fetch data'}));
                }
            },
        },
        {
            method: 'POST',
            path: '/api/ai/data',
            handler: async (req: IncomingMessage & RequestExtras, res: ServerResponse) => {
                try {
                    if (!req.db) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({success: false, error: 'Database not available'}));
                        return;
                    }
                    const dataPoint = validateDataPoint(req.body);
                    if (!dataPoint) {
                        res.statusCode = 400;
                        res.end(JSON.stringify({success: false, error: 'Invalid data'}));
                        return;
                    }
                    await new Promise<void>((resolve, reject) => {
                        req.db!.run('INSERT INTO data_points (x, y) VALUES (?, ?)', [dataPoint.x, dataPoint.y], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                    res.statusCode = 200;
                    res.end(JSON.stringify({success: true, data: dataPoint}));
                } catch (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({success: false, error: 'Failed to insert data'}));
                }
            },
        },
        {
            method: 'DELETE',
            path: '/api/ai/data',
            handler: async (req: IncomingMessage & RequestExtras, res: ServerResponse) => {
                try {
                    if (!req.db) {
                        res.statusCode = 500;
                        res.end(JSON.stringify({success: false, error: 'Database not available'}));
                        return;
                    }
                    await new Promise<void>((resolve, reject) => {
                        req.db!.run('DELETE FROM data_points', (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                    res.statusCode = 200;
                    res.end(JSON.stringify({success: true, message: 'All data points cleared'}));
                } catch (err) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({success: false, error: 'Failed to clear data points'}));
                }
            },
        },
    ];
}
