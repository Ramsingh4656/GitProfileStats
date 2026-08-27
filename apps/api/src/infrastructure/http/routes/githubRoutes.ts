import { Router } from 'express';
import { container } from '../../../config/container.js';
import { GitHubController } from '../controllers/GitHubController.js';
import { validateGitHubRequest } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';
import { optionalAuthGuard } from '../middleware/optionalAuthGuard.js';

const router = Router();
const gitHubController = container.resolve(GitHubController);

// Register routes with request validation and caching middleware
router.get(
  '/stats',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getStats,
);
router.get(
  '/repositories',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getRepositories,
);
router.get(
  '/languages',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getLanguages,
);
router.get(
  '/contributions',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getContributions,
);
router.get(
  '/commits',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getCommits,
);
router.get(
  '/pull-requests',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getPullRequests,
);
router.get(
  '/issues',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getIssues,
);
router.get(
  '/statistics',
  optionalAuthGuard,
  validateGitHubRequest,
  cacheMiddleware(300),
  gitHubController.getCombinedStatistics,
);

export const githubRoutes = router;
