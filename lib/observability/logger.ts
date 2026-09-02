import 'server-only';

type LogLevel = 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

const SENSITIVE_KEY = /email|phone|national|password|secret|token|authorization|cookie|payload/i;

function sanitize(context: LogContext): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      SENSITIVE_KEY.test(key)
        ? '[REDACTED]'
        : value instanceof Error
          ? { name: value.name, message: value.message }
          : value,
    ]),
  );
}

function write(level: LogLevel, event: string, context: LogContext = {}) {
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...sanitize(context),
  });
  if (level === 'error') console.error(record);
  else if (level === 'warn') console.warn(record);
  else console.info(record);
}

export const logger = {
  info: (event: string, context?: LogContext) => write('info', event, context),
  warn: (event: string, context?: LogContext) => write('warn', event, context),
  error: (event: string, context?: LogContext) => write('error', event, context),
};
