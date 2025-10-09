import { getSettings } from '../config/get-settings';
import chalk from 'chalk';

// Interface for log labels
interface LogLabels {
    [key: string]: string | number | undefined;
}

// Simplified console logger with colored output
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

        switch (level) {
            case 'info':
                console.log(chalk.greenBright(formattedMessage));
                break;
            case 'debug':
                console.log(chalk.blueBright(formattedMessage));
                break;
            case 'error':
                console.error(chalk.redBright(formattedMessage));
                break;
            case 'warn':
                console.log(chalk.yellowBright(formattedMessage));
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
        console.log(chalk.cyanBright(`[${timestamp}] METRIC: ${name}=${value} ${this.formatLabels(labels)}`));
    }
}