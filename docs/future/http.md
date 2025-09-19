
cortex/http/
│
├── engines/                    # Pluggable HTTP engines
│   ├── express.ts               # Express engine
│   ├── fastify.ts               # Fastify engine
│   └── custom.ts                # Placeholder for future custom engine
│
├── adapters/                   # Storage & messaging
│   ├── storage.ts               # IStorageAdapter interface
│   ├── storage.memory.ts        # In-memory store
│   ├── storage.redis.ts         # Redis store + pub/sub
│   ├── message.ts               # IMessageBus interface
│   ├── message.redis.ts         # Redis pub/sub adapter
│   └── message.memory.ts        # Local event bus (dev/test)
│
├── middleware/                 # Shared middlewares
│   ├── cors.ts                  # CORS handling
│   ├── compression.ts           # gzip/deflate
│   ├── security.ts              # Helmet, CSP, rate-limiting
│   ├── tenant.ts                # Tenant header parsing
│   ├── session.ts               # Session + state handler
│   ├── auth.jwt.ts              # JWT auth & refresh
│   └── rbac.ts                  # Role-based access control
│
├── protocols/                  # Protocol servers
│   ├── http1.ts                 # HTTP/1.1 server
│   ├── http2.ts                 # HTTP/2 server
│   ├── http3.ts                 # (future) HTTP/3 QUIC support
│   └── websocket.ts             # WebSocket / SSE integration
│
├── cluster/                    
│   └── server.cluster.ts        # Node.js cluster manager
│
├── core/
│   ├── chttp.ts                 # Main abstraction (entrypoint)
│   ├── response.helpers.ts      # res.html, res.raw, etc.
│   └── config.ts                # Centralized config loader
│
└── utils/
├── logger.ts                # Structured logging (winston/pino)
├── metrics.ts               # Prometheus/OpenTelemetry hooks
└── errors.ts                # Unified error classes
