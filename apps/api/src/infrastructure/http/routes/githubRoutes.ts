import { Router } from 'express';
import { container } from '../../../config/container.js';
import { GitHubController } from '../controllers/GitHubController.js';
import { validateGitHubRequest } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();
const gitHubController = container.resolve(GitHubController);

// Register routes with request validation and caching middleware
router.get('/stats', cacheMiddleware(300), validateGitHubRequest, gitHubController.getStats);
router.get('/repositories', cacheMiddleware(300), validateGitHubRequest, gitHubController.getRepositories);
router.get('/languages', cacheMiddleware(300), validateGitHubRequest, gitHubController.getLanguages);
router.get('/contributions', cacheMiddleware(300), validateGitHubRequest, gitHubController.getContributions);
router.get('/commits', cacheMiddleware(300), validateGitHubRequest, gitHubController.getCommits);
router.get('/pull-requests', cacheMiddleware(300), validateGitHubRequest, gitHubController.getPullRequests);
router.get('/issues', cacheMiddleware(300), validateGitHubRequest, gitHubController.getIssues);
router.get('/statistics', cacheMiddleware(300), validateGitHubRequest, gitHubController.getCombinedStatistics);

export const githubRoutes = router;
