// cortex/core/logger.ts
import util from "util";

export type LogLevel = "debug" | "info" | "warn" | "error";

export class Logger {
    private level: LogLevel = "info";

    // ANSI colors
    private colors: Record<string, string> = {
        reset: "\x1b[0m",
        gray: "\x1b[90m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        red: "\x1b[31m",
        cyan: "\x1b[36m",
    };

    // Emojis per level
    private emojis: Record<LogLevel, string> = {
        debug: "🔍",
        info: "ℹ️",
        warn: "⚠️",
        error: "❌",
    };

    setLevel(level: LogLevel) {
        this.level = level;
    }

    private shouldLog(level: LogLevel): boolean {
        const order: LogLevel[] = ["debug", "info", "warn", "error"];
        return order.indexOf(level) >= order.indexOf(this.level);
    }

    private format(level: LogLevel, message: string, ...meta: any[]) {
        const ts = new Date().toISOString();
        const metaStr = meta.length
            ? " " +
            meta
                .map((m) =>
                    typeof m === "string"
                        ? m
                        : util.inspect(m, { depth: 3, colors: true })
                )
                .join(" ")
            : "";
        return `[${ts}] ${this.emojis[level]} [${level.toUpperCase()}] ${message}${metaStr}`;
    }

    debug(message: string, ...meta: any[]) {
        if (this.shouldLog("debug")) {
            console.debug(
                this.colors.gray + this.format("debug", message, ...meta) + this.colors.reset
            );
        }
    }

    info(message: string, ...meta: any[]) {
        if (this.shouldLog("info")) {
            console.info(
                this.colors.green + this.format("info", message, ...meta) + this.colors.reset
            );
        }
    }

    warn(message: string, ...meta: any[]) {
        if (this.shouldLog("warn")) {
            console.warn(
                this.colors.yellow + this.format("warn", message, ...meta) + this.colors.reset
            );
        }
    }

    error(message: string, ...meta: any[]) {
        if (this.shouldLog("error")) {
            console.error(
                this.colors.red + this.format("error", message, ...meta) + this.colors.reset
            );
        }
    }

    // -------------------------------------------------------------------------
    // HTTP request/response logging
    // -------------------------------------------------------------------------
    logRequest(method: string, url: string) {
        const ts = new Date().toISOString();
        console.info(
            this.colors.cyan +
            `[${ts}] 📥 [REQ] ${method.toUpperCase()} ${url}` +
            this.colors.reset
        );
    }

    logResponse(method: string, url: string, status: number, ms: number) {
        const ts = new Date().toISOString();
        let color = this.colors.green;
        let emoji = "✅";
        if (status >= 400 && status < 500) {
            color = this.colors.yellow;
            emoji = "⚠️";
        }
        if (status >= 500) {
            color = this.colors.red;
            emoji = "💥";
        }

        console.info(
            color +
            `[${ts}] ${emoji} [RES] ${method.toUpperCase()} ${url} → ${status} (${ms}ms)` +
            this.colors.reset
        );
    }

    // -------------------------------------------------------------------------
    // Database query logging
    // -------------------------------------------------------------------------
    async logQuery<T>(
        queryFn: () => Promise<T>,
        sql: string,
        params?: any[]
    ): Promise<T> {
        const start = Date.now();
        try {
            const result = await queryFn();
            const ms = Date.now() - start;
            this.debug(`🗄️ SQL OK: ${sql}`, params ?? []);
            this.debug(`⏱️ Duration: ${ms}ms`);
            return result;
        } catch (err) {
            const ms = Date.now() - start;
            this.error(`🛑 SQL FAIL: ${sql}`, params ?? [], `(${ms}ms)`, err);
            throw err;
        }
    }
}
