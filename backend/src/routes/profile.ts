import { Router } from 'express';
import { requireAuth } from '../middleware/authGuard';
import {
  getProfileController,
  getPublicProfileController,
  updateProfileController,
} from '../controllers/profileController';

const router = Router();

router.get('/', requireAuth, getProfileController);
router.get('/:id', getPublicProfileController);
router.put('/', requireAuth, updateProfileController);

export default router;

