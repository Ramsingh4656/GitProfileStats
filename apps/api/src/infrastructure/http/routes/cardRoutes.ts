import { Router } from 'express';
import { container } from '../../../config/container.js';
import { CardController } from '../controllers/CardController.js';
import { validateGitHubRequest } from '../middleware/validation.js';

const router = Router();
const cardController = container.resolve(CardController);

// Register profile card route under /cards/profile.svg
router.get('/cards/profile.svg', validateGitHubRequest, cardController.getProfileCard);

export const cardRoutes = router;
