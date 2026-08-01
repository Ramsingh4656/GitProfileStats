import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

app.listen(env.PORT, () => {
  logger.info(`🚀 API Server running on port ${env.PORT.toString()} in ${env.NODE_ENV} mode`);
});
