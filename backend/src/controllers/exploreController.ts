import { Request, Response, NextFunction } from 'express';
import { getExploreFeed, getExploreMap } from '../services/exploreService';

export const getFeed = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getExploreFeed();
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMap = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { lat, lng, radius } = req.query;

    if (lat === undefined || lng === undefined || radius === undefined) {
      const error: any = new Error('Missing required query parameters: lat, lng, and radius');
      error.statusCode = 400;
      throw error;
    }

    const latNum = Number(lat);
    const lngNum = Number(lng);
    const radiusNum = Number(radius);

    if (isNaN(latNum) || isNaN(lngNum) || isNaN(radiusNum)) {
      const error: any = new Error('Invalid query parameters: lat, lng, and radius must be valid numbers');
      error.statusCode = 400;
      throw error;
    }

    const data = await getExploreMap(latNum, lngNum, radiusNum);
    res.json(data);
  } catch (error) {
    next(error);
  }
};
