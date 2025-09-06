import { FastifyInstance } from 'fastify';
import { RouteRegistery } from '../http/route_registery';
import { z } from 'zod';

const dataPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export function registerAIRoutes(registry: RouteRegistery) {
  registry.register((server: FastifyInstance) => {
    server.post('/api/ai/data', async (request, reply) => {
      try {
        const { x, y } = dataPointSchema.parse(request.body);
        const db = request.db; // Adjust based on your dbContextMiddleware implementation
        await db.run('INSERT INTO data_points (x, y) VALUES (?, ?)', [x, y]);
        return { success: true, data: { x, y } };
      } catch (err) {
        request.log.error(err);
        return reply.status(400).send({ success: false, error: 'Invalid data' });
      }
    });

    server.get('/api/ai/data', async (request, reply) => {
      try {
        const db = request.db; // Adjust based on your dbContextMiddleware implementation
        const dataPoints = await db.all('SELECT x, y FROM data_points');
        return { success: true, data: dataPoints };
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'Failed to fetch data' });
      }
    });

    server.delete('/api/ai/data', async (request, reply) => {
      try {
        const db = request.db; // Adjust based on your dbContextMiddleware implementation
        await db.run('DELETE FROM data_points');
        return { success: true, message: 'All data points cleared' };
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ success: false, error: 'Failed to clear data points' });
      }
    });
  });
}