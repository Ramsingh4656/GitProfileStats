import { Router } from 'express';
import { container } from '../../../config/container.js';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();
const authController = container.resolve(AuthController);

router.get('/github', authController.loginWithGithub);
router.get('/github/callback', authController.handleGithubCallback);

export const authRoutes = router;
