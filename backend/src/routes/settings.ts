import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';

const router = Router();

router.get('/hero', settingsController.getHeroSettings);

export default router;
