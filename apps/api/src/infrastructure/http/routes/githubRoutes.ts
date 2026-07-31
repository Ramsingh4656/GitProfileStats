import { Router } from 'express';
import { container } from '../../../config/container.js';
import { GitHubController } from '../controllers/GitHubController.js';
import { validateGitHubRequest } from '../middleware/validation.js';

const router = Router();
const gitHubController = container.resolve(GitHubController);

// Register routes with request validation middleware
router.get('/stats', validateGitHubRequest, gitHubController.getStats);
router.get('/repositories', validateGitHubRequest, gitHubController.getRepositories);
router.get('/languages', validateGitHubRequest, gitHubController.getLanguages);
router.get('/contributions', validateGitHubRequest, gitHubController.getContributions);
router.get('/commits', validateGitHubRequest, gitHubController.getCommits);
router.get('/pull-requests', validateGitHubRequest, gitHubController.getPullRequests);
router.get('/issues', validateGitHubRequest, gitHubController.getIssues);
router.get('/statistics', validateGitHubRequest, gitHubController.getCombinedStatistics);

export const githubRoutes = router;
