import { Router } from 'express';
import { requireAuth } from '../middleware/authGuard';
import { registerMerchantController } from '../controllers/merchantController';

const router = Router();

router.post('/register', requireAuth, registerMerchantController);

export default router;
