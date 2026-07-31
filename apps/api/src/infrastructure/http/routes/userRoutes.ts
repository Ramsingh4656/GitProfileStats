import { Router } from 'express';
import { container } from '../../../config/container.js';
import { UserController } from '../controllers/UserController.js';
import { authGuard } from '../middleware/authGuard.js';

const router = Router();
const userController = container.resolve(UserController);

router.get('/me', authGuard, userController.getUserProfile);
router.put('/settings', authGuard, userController.updateUserSettings);

export const userRoutes = router;
