import { Router } from 'express';
import { container } from '../../../config/container.js';
import { CardController } from '../controllers/CardController.js';
import { validateGitHubRequest, validateRepositoryRequest } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { optionalAuthGuard } from '../middleware/optionalAuthGuard.js';

const router = Router();
const cardController = container.resolve(CardController);

// Register profile card route under /cards/profile.svg
router.get(
  '/cards/profile.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getProfileCard,
);

// Register stats card route under /cards/stats.svg
router.get(
  '/cards/stats.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getStatsCard,
);

// Register languages card route under /cards/languages.svg
router.get(
  '/cards/languages.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getLanguagesCard,
);

// Register trophies card route under /cards/trophies.svg
router.get(
  '/cards/trophies.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getTrophiesCard,
);

// Register top contributed repos card route under /cards/top-contributed.svg
router.get(
  '/cards/top-contributed.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getTopContributedCard,
);

// Register repository rankings card route under /cards/rankings.svg
router.get(
  '/cards/rankings.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getRankingsCard,
);

// Register streak card route under /cards/streak.svg
router.get(
  '/cards/streak.svg',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  cardController.getStreakCard,
);

// Register repository card route under /cards/repository.svg
router.get(
  '/cards/repository.svg',
  optionalAuthGuard,
  validateRepositoryRequest,
  cacheMiddleware(300),
  cardController.getRepositoryCard,
);

export const cardRoutes = router;
