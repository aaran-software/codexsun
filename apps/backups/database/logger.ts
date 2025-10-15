import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface Logger<TMeta extends Record<string, unknown> = Record<string, unknown>> {
    debug(message: string, meta?: TMeta): void;
    info(message: string, meta?: TMeta): void;
    warn(message: string, meta?: TMeta): void;
    error(message: string, meta?: TMeta): void;
    flush(): Promise<void>;
}

export function createLogger<TMeta extends Record<string, unknown> = Record<string, unknown>>(service: string): Logger<TMeta> {
    const logDir = join(process.cwd(), 'logs');
    if (!existsSync(logDir)) {
        try {
            mkdirSync(logDir, { recursive: true });
        } catch (err: unknown) {
            throw new Error(`Failed to create log directory: ${(err as Error).message}`);
        }
    }

    let currentLogFile = join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
    let logStream: import('fs').WriteStream;
    try {
        logStream = createWriteStream(currentLogFile, { flags: 'a' });
    } catch (err: unknown) {
        throw new Error(`Failed to create log stream: ${(err as Error).message}`);
    }

    const isDebug = process.env.APP_DEBUG === 'true';

    const writeLog = (level: string, message: string, meta?: TMeta) => {
        if (level === 'debug' && !isDebug) return;

        const logEntry = {
            timestamp: new Date().toISOString(),
            level,
            service,
            message,
            ...meta,
        };

        const serialize = (obj: unknown) =>
            JSON.stringify(obj, (key: string, value: unknown) =>
                typeof value === 'bigint' ? value.toString() : value
            );

        try {
            logStream.write(serialize(logEntry) + '\n', (err: Error | null) => {
                if (err) console.error(`Failed to write to log file: ${err.message}`);
            });

            if (isDebug || level === 'error' || level === 'warn') {
                console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
                    `[${service}] ${level.toUpperCase()}: ${message}`,
                    meta || ''
                );
            }
        } catch (err: unknown) {
            console.error(`Log serialization failed: ${(err as Error).message}`);
        }
    };

    logStream.on('error', (err: Error) => {
        console.error(`Log stream error: ${err.message}`);
    });

    setInterval(() => {
        const newLogFile = join(logDir, `app-${new Date().toISOString().split('T')[0]}.log`);
        if (newLogFile !== currentLogFile) {
            try {
                logStream.end();
                currentLogFile = newLogFile;
                logStream = createWriteStream(currentLogFile, { flags: 'a' });
                logStream.on('error', (err: Error) => console.error(`New log stream error: ${err.message}`));
            } catch (err: unknown) {
                console.error(`Failed to create new log stream: ${(err as Error).message}`);
            }
        }
    }, 24 * 60 * 60 * 1000);

    return {
        debug: (message: string, meta?: TMeta) => writeLog('debug', message, meta),
        info: (message: string, meta?: TMeta) => writeLog('info', message, meta),
        warn: (message: string, meta?: TMeta) => writeLog('warn', message, meta),
        error: (message: string, meta?: TMeta) => writeLog('error', message, meta),
        flush: () =>
            new Promise((resolve, reject) => {
                try {
                    logStream.write('', (err: Error | null) => {
                        if (err) reject(new Error(`Failed to flush logs: ${err.message}`));
                        else resolve();
                    });
                } catch (err: unknown) {
                    reject(new Error(`Failed to flush logs: ${(err as Error).message}`));
                }
            }),
    };
}