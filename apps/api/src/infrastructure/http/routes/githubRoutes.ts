import { Router } from 'express';
import { container } from '../../../config/container.js';
import { GitHubController } from '../controllers/GitHubController.js';
import { validateGitHubRequest } from '../middleware/validation.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();
const gitHubController = container.resolve(GitHubController);

// Register routes with request validation and caching middleware
router.get('/stats', validateGitHubRequest, cacheMiddleware(300), gitHubController.getStats);
router.get('/repositories', validateGitHubRequest, cacheMiddleware(300), gitHubController.getRepositories);
router.get('/languages', validateGitHubRequest, cacheMiddleware(300), gitHubController.getLanguages);
router.get('/contributions', validateGitHubRequest, cacheMiddleware(300), gitHubController.getContributions);
router.get('/commits', validateGitHubRequest, cacheMiddleware(300), gitHubController.getCommits);
router.get('/pull-requests', validateGitHubRequest, cacheMiddleware(300), gitHubController.getPullRequests);
router.get('/issues', validateGitHubRequest, cacheMiddleware(300), gitHubController.getIssues);
router.get('/statistics', validateGitHubRequest, cacheMiddleware(300), gitHubController.getCombinedStatistics);

export const githubRoutes = router;
