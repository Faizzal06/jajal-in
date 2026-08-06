import { Router, Request, Response, NextFunction } from 'express';
import { checkAdExpiration } from '../cron/adExpiration';

const router = Router();

router.get('/ad-expiration', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}` && req.query.secret !== cronSecret) {
      res.status(401).json({ error: 'Unauthorized cron request' });
      return;
    }

    await checkAdExpiration();
    res.json({ success: true, message: 'Ad expiration check completed' });
  } catch (error) {
    next(error);
  }
});

export default router;
