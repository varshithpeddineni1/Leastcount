import pino from 'pino';

// OBS-1: structured JSON logs everywhere; never console.log.
export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
});
