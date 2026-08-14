import { Router } from 'express';
import { getRegionsHandler } from '../controllers/regionsController';

const router = Router();

router.get('/', getRegionsHandler);

export default router;
