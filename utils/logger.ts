import fs from 'fs';
import path from 'path';

const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logFile = path.join(logDir, 'api-execution.log');

export class Logger {
    static info(message: string, meta?: unknown) {
        this.write('INFO', message, meta);
    }

    static warn(message: string, meta?: unknown) {
        this.write('WARN', message, meta);
    }

    static error(message: string, meta?: unknown) {
        this.write('ERROR', message, meta);
    }

    private static write(level: string, message: string, meta?: unknown) {
        const timestamp = new Date().toISOString();
        const safeMeta = this.serializeMeta(meta);
        const logLine = safeMeta
            ? `[${timestamp}] [${level}] ${message}\n${safeMeta}\n${'-'.repeat(60)}\n`
            : `[${timestamp}] [${level}] ${message}\n${'-'.repeat(60)}\n`;

        console.log(logLine.trimEnd());
        fs.appendFileSync(logFile, logLine, 'utf8');
    }

    private static serializeMeta(meta: unknown): string {
        if (meta === undefined || meta === null) return '';

        try {
            return JSON.stringify(meta, null, 2);
        } catch {
            return String(meta);
        }
    }
}