import { Router } from 'express';
import { container } from '../../../config/container.js';
import { CardController } from '../controllers/CardController.js';
import { validateGitHubRequest } from '../middleware/validation.js';

const router = Router();
const cardController = container.resolve(CardController);

// Register profile card route under /cards/profile.svg
router.get('/cards/profile.svg', validateGitHubRequest, cardController.getProfileCard);

// Register stats card route under /cards/stats.svg
router.get('/cards/stats.svg', validateGitHubRequest, cardController.getStatsCard);


export const cardRoutes = router;
