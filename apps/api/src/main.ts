import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { routes } from './infrastructure/http/routes/index.js';
import { githubRoutes } from './infrastructure/http/routes/githubRoutes.js';
import { cardRoutes } from './infrastructure/http/routes/cardRoutes.js';
import { errorHandler } from './infrastructure/http/middleware/errorHandler.js';
import { container } from './config/container.js';
import { HealthController } from './infrastructure/http/controllers/HealthController.js';
import {
  GitHubService,
  LanguageCollectorService,
  StatsService,
  RepositoryStatsService,
  CommitStatsService,
  ContributionService,
  PullRequestService,
  IssueStatisticsService,
  GitHubStatisticsService,
} from './github/index.js';

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

// Temporary test endpoint
app.get('/api/test/github', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const gitHubService = container.resolve(GitHubService);
      const user = await gitHubService.getAuthenticatedUser(token);
      res.json({
        username: user.login,
        avatar: user.avatar_url,
        'public repositories': user.public_repos,
        followers: user.followers,
      });
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for language collection
app.get('/api/test/github/languages', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const languageCollector = container.resolve(LanguageCollectorService);
      const result = await languageCollector.collectLanguages(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for profile stats
app.get('/api/test/github/stats', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const statsService = container.resolve(StatsService);
      const result = await statsService.getStats(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for repository stats
app.get('/api/test/github/repo-stats', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const repositoryStatsService = container.resolve(RepositoryStatsService);
      const result = await repositoryStatsService.getRepositoryStats(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for commit stats
app.get('/api/test/github/commit-stats', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const commitStatsService = container.resolve(CommitStatsService);
      const result = await commitStatsService.getCommitStats(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for contribution stats
app.get('/api/test/github/contribution-stats', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const contributionService = container.resolve(ContributionService);
      const result = await contributionService.getContributionStats(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for pull request stats
app.get('/api/test/github/pull-requests', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const pullRequestService = container.resolve(PullRequestService);
      const result = await pullRequestService.getPullRequestStats(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for issue stats
app.get('/api/test/github/issue-stats', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const issueStatisticsService = container.resolve(IssueStatisticsService);
      const result = await issueStatisticsService.getIssueStats(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// Temporary test endpoint for combined github statistics
app.get('/api/test/github/statistics', (req, res, next) => {
  void (async () => {
    try {
      const token =
        (req.query.token as string) || (req.headers['x-github-token'] as string) || undefined;
      const username = (req.query.username as string) || undefined;
      const githubStatisticsService = container.resolve(GitHubStatisticsService);
      const result = await githubStatisticsService.getCombinedStatistics(username, { token });
      res.json(result);
    } catch (error) {
      next(error);
    }
  })();
});

// API Routes
app.use('/api/v1', routes);
app.use('/api', githubRoutes);
app.use('/api', cardRoutes);

// Centralized error handling
app.use(errorHandler);

app.listen(env.PORT, () => {
  logger.info(`🚀 API Server running on port ${env.PORT.toString()} in ${env.NODE_ENV} mode`);
});
