/**
 * Centralized Logger Service
 * Only logs in development mode for debug/info
 * Always logs warnings and errors
 */

const isDev = import.meta.env.DEV;

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  timestamp: string;
  message: string;
  data?: unknown;
}

class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 23);
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (isDev) {
      console.info(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.formatMessage('warn', message), ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.formatMessage('error', message), ...args);
  }

  // For structured logging that could be sent to analytics
  log(entry: Omit<LogEntry, 'timestamp'>): void {
    const fullEntry: LogEntry = {
      ...entry,
      timestamp: new Date().toISOString(),
    };

    switch (entry.level) {
      case 'debug':
        this.debug(entry.message, entry.data);
        break;
      case 'info':
        this.info(entry.message, entry.data);
        break;
      case 'warn':
        this.warn(entry.message, entry.data);
        break;
      case 'error':
        this.error(entry.message, entry.data);
        break;
    }
  }
}

export const logger = new Logger();
