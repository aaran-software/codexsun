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
        this.isDebug = settings.APP_DEBUG || process.env.NODE_ENV === 'production';
    }

    // Format timestamp in IST (e.g., 2025-10-07 22:41:23)
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

    // Format labels for metrics
    private formatLabels(labels: LogLabels): string {
        return Object.entries(labels)
            .filter(([_, value]) => value !== undefined)
            .map(([key, value]) => `${key}="${value}"`)
            .join(', ');
    }

    // Generic log method with color
    private log(level: 'info' | 'debug' | 'error', message: string, data?: LogLabels): void {
        if (level === 'debug' && !this.isDebug) return;
        const timestamp = this.formatTimestamp();
        const formattedMessage = data
            ? `[${timestamp}] ${level.toUpperCase()}: ${message} {${this.formatLabels(data)}}`
            : `[${timestamp}] ${level.toUpperCase()}: ${message}`;

        switch (level) {
            case 'info':
                console.log(chalk.green(formattedMessage));
                break;
            case 'debug':
                console.log(chalk.blue(formattedMessage));
                break;
            case 'error':
                console.error(chalk.red(formattedMessage));
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

    // Log metrics
    metric(name: string, value: number, labels: LogLabels): void {
        if (!this.isDebug) return;
        const timestamp = this.formatTimestamp();
        console.log(chalk.cyan(`[${timestamp}] METRIC: ${name}=${value} {${this.formatLabels(labels)}}`));
    }
}