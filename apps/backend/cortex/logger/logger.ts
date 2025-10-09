import { getSettings } from '../config/get-settings';

// Interface for log labels
interface LogLabels {
    [key: string]: string | number | undefined;
}

// ANSI color codes
const COLORS = {
    green: '\x1b[32m', // Bright green
    blue: '\x1b[34m',  // Bright blue
    red: '\x1b[31m',   // Bright red
    yellow: '\x1b[33m', // Bright yellow
    cyan: '\x1b[36m',  // Bright cyan
    reset: '\x1b[0m',  // Reset color
};

// Simplified console logger with native ANSI colored output
export class Logger {
    private readonly isDebug: boolean;

    constructor() {
        const settings = getSettings();
        this.isDebug = settings.APP_DEBUG || process.env.NODE_ENV !== 'production';
    }

    // Format timestamp in IST (e.g., 2025-10-09 10:44:23)
    private formatTimestamp(): string {
        return new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/,/, '');
    }

    // Format labels for logs
    private formatLabels(labels: LogLabels): string {
        // Special handling for request and response logs
        if (labels.method && labels.url) {
            const base = [labels.method, `"${labels.url}"`];
            if (labels.statusCode) {
                base.push(labels.statusCode.toString());
            }
            if (labels.responseTimeMs !== undefined) {
                base.push(`${labels.responseTimeMs}ms`);
            }
            if (labels.content) {
                base.push(`content="${labels.content}"`);
            }
            return `{${base.join(', ')}}`;
        }
        // Fallback for other logs
        return Object.entries(labels)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}="${value}"`)
            .join(', ');
    }

    // Generic log method with color
    private log(level: 'info' | 'debug' | 'error' | 'warn', message: string, data?: LogLabels): void {
        if (level === 'debug' && !this.isDebug) return;
        const timestamp = this.formatTimestamp();
        const formattedMessage = data
            ? `[${timestamp}] ${level.toUpperCase()}: ${message} ${this.formatLabels(data)}`
            : `[${timestamp}] ${level.toUpperCase()}: ${message}`;

        let coloredMessage: string;
        switch (level) {
            case 'info':
                coloredMessage = `${COLORS.green}${formattedMessage}${COLORS.reset}`;
                console.log(coloredMessage);
                break;
            case 'debug':
                coloredMessage = `${COLORS.blue}${formattedMessage}${COLORS.reset}`;
                console.log(coloredMessage);
                break;
            case 'error':
                coloredMessage = `${COLORS.red}${formattedMessage}${COLORS.reset}`;
                console.error(coloredMessage);
                break;
            case 'warn':
                coloredMessage = `${COLORS.yellow}${formattedMessage}${COLORS.reset}`;
                console.log(coloredMessage);
                break;
        }
    }

    // Log info messages
    info(message: string, labels?: LogLabels): void {
        this.log('info', message, labels);
    }

    // Log debug messages
    debug(message: string, labels?: LogLabels): void {
        this.log('debug', message, labels);
    }

    // Log error messages
    error(message: string, labels?: LogLabels): void {
        this.log('error', message, labels);
    }

    // Log warn messages
    warn(message: string, labels?: LogLabels): void {
        this.log('warn', message, labels);
    }

    // Log metrics
    metric(name: string, value: number, labels: LogLabels): void {
        if (!this.isDebug) return;
        const timestamp = this.formatTimestamp();
        const formattedMessage = `[${timestamp}] METRIC: ${name}=${value} ${this.formatLabels(labels)}`;
        console.log(`${COLORS.cyan}${formattedMessage}${COLORS.reset}`);
    }
}