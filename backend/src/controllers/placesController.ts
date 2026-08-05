import { Request, Response, NextFunction } from 'express';
import { getPlaceById } from '../services/placesService';

export const getPlaceByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      const error: any = new Error('Place ID is required');
      error.statusCode = 400;
      throw error;
    }

    const data = await getPlaceById(id);
    res.json(data);
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      error.statusCode = 404;
      error.message = 'Place not found';
    }
    next(error);
  }
};
