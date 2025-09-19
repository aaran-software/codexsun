// index.ts

import {CHttp} from "./cortex/http/chttpx";
import {bootstrap} from "./cortex/main";
import {APP} from "./cortex/core/application";

async function startServer() {
    try {
        await bootstrap();

        const PORT = process.env.PORT || 3000;
        const server = CHttp.createServer((req, res) => {
            if (!APP.handle(req, res)) {
                res.writeHead(404, {"Content-Type": "application/json"});
                res.end(JSON.stringify({error: "Not Found"}));
            }
        });

        server.listen(PORT, () => {
            APP.logger.info(`✅ Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err);
        process.exit(1);
    }
}

void startServer();
