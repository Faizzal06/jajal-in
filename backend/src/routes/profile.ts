import { Router } from 'express';
import { requireAuth } from '../middleware/authGuard';
import { getProfileController } from '../controllers/profileController';

const router = Router();

router.get('/', requireAuth, getProfileController);

export default router;
