import { Router } from 'express';
import { getLeaderboardController } from '../controllers/awardsController';

const router = Router();

router.get('/leaderboard', getLeaderboardController);

export default router;
