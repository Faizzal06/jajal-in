import { Router } from 'express';
import { getFeed, getMap } from '../controllers/exploreController';

const router = Router();

router.get('/feed', getFeed);
router.get('/map', getMap);

export default router;
