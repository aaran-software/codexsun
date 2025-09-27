// index.ts

import { CHttp } from './cortex/http/chttpx.js';
import { bootstrap } from './cortex/main.js';
import { APP } from './cortex/core/application.js';

async function startServer() {
  try {
    await bootstrap();

    const PORT = process.env.PORT || 3006;
    const server = CHttp.createServer((req, res) => {
      if (!APP.handle(req, res)) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });

    server.listen(PORT, () => {
      APP.logger.info(`✅ Server running at http://localhost:${PORT}`);

      // At the top of startServer()
      process.on('uncaughtException', (err) => {
        console.error('Uncaught Exception:', err);
        // Optionally restart or notify admins; don't exit
      });

      process.on('unhandledRejection', (reason, promise) => {
        console.error('Unhandled Rejection at:', promise, 'reason:', reason);
        // Handle or log; don't exit
      });

    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

void startServer();
