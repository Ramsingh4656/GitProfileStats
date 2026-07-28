import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { routes } from './infrastructure/http/routes/index.js';
import { errorHandler } from './infrastructure/http/middleware/errorHandler.js';
import { container } from './config/container.js';
import { HealthController } from './infrastructure/http/controllers/HealthController.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.WEB_BASE_URL, credentials: true }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger middleware
app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url }, 'Incoming request');
  next();
});

// Health check endpoint
const healthController = container.resolve(HealthController);
app.get('/health', healthController.check);

// API Routes
app.use('/api/v1', routes);

// Centralized error handling
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`🚀 API Server running on port ${env.PORT.toString()} in ${env.NODE_ENV} mode`);
});

