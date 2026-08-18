import { Router } from 'express';
import { requireAuth } from '../middleware/authGuard';
import {
  registerMerchantController,
  getMyMerchantsController,
} from '../controllers/merchantController';

const router = Router();

router.post('/register', requireAuth, registerMerchantController);
router.get('/my-merchants', requireAuth, getMyMerchantsController);

export default router;

