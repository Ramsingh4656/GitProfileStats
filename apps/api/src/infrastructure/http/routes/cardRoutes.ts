import { Router } from 'express';
import { container } from '../../../config/container.js';
import { CardController } from '../controllers/CardController.js';
import { validateGitHubRequest, validateRepositoryRequest } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();
const cardController = container.resolve(CardController);

// Register profile card route under /cards/profile.svg
router.get(
  '/cards/profile.svg',
  cacheMiddleware(300),
  validateGitHubRequest,
  cardController.getProfileCard,
);

// Register stats card route under /cards/stats.svg
router.get(
  '/cards/stats.svg',
  cacheMiddleware(300),
  validateGitHubRequest,
  cardController.getStatsCard,
);

// Register languages card route under /cards/languages.svg
router.get(
  '/cards/languages.svg',
  cacheMiddleware(300),
  validateGitHubRequest,
  cardController.getLanguagesCard,
);

// Register streak card route under /cards/streak.svg
router.get(
  '/cards/streak.svg',
  cacheMiddleware(300),
  validateGitHubRequest,
  cardController.getStreakCard,
);

// Register repository card route under /cards/repository.svg
router.get(
  '/cards/repository.svg',
  cacheMiddleware(300),
  validateRepositoryRequest,
  cardController.getRepositoryCard,
);

export const cardRoutes = router;
