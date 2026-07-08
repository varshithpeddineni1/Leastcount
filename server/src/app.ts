import express, { type Express } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from './logger.js';
import { healthRouter } from './http/health.js';

export function createApp(): Express {
  const app = express();
  app.use(pinoHttp({ logger }));
  app.use(express.json());
  app.use('/health', healthRouter);
  return app;
}
