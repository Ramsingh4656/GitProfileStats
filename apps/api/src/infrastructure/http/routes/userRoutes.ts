import { Router } from 'express';
import { container } from '../../../config/container.js';
import { UserController } from '../controllers/UserController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();
const userController = container.resolve(UserController);

router.get('/me', authGuard, userController.getUserProfile);
router.put('/settings', authGuard, userController.updateUserSettings);
router.put('/github-token', authGuard, userController.setGithubToken);
router.delete('/github-token', authGuard, userController.clearGithubToken);

export const userRoutes = router;
