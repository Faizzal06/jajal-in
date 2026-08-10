import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { createContribution } from '../services/contributionsService';

export const createContributionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user || !user.id) {
      const error: any = new Error('Unauthorized: User ID missing');
      error.statusCode = 401;
      throw error;
    }

    const { name, description, lat, lng, regionId, categoryId, media, highlights } = req.body || {};

    if (
      !name ||
      typeof name !== 'string' ||
      name.trim() === '' ||
      !description ||
      typeof description !== 'string' ||
      description.trim() === '' ||
      !regionId ||
      typeof regionId !== 'string' ||
      regionId.trim() === '' ||
      !categoryId ||
      typeof categoryId !== 'string' ||
      categoryId.trim() === '' ||
      lat === undefined ||
      lat === null ||
      lng === undefined ||
      lng === null
    ) {
      const error: any = new Error(
        'Missing required fields: name, description, lat, lng, regionId, and categoryId are required'
      );
      error.statusCode = 400;
      throw error;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);

    if (isNaN(latNum) || isNaN(lngNum)) {
      const error: any = new Error('Invalid coordinates: lat and lng must be valid numbers');
      error.statusCode = 400;
      throw error;
    }

    const result = await createContribution(user.id, {
      name,
      description,
      lat: latNum,
      lng: lngNum,
      regionId,
      categoryId,
      media: Array.isArray(media) ? media : undefined,
      highlights: Array.isArray(highlights) ? highlights : undefined,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
