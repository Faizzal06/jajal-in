import { Router } from 'express';
import { getPlaceByIdController } from '../controllers/placesController';

const router = Router();

router.get('/:id', getPlaceByIdController);

export default router;
