import { Router } from 'express';
import { requireAuth } from '../middleware/authGuard';
import { createContributionController } from '../controllers/contributionsController';

const router = Router();

router.post('/', requireAuth, createContributionController);

export default router;
