import { Request, Response, NextFunction } from 'express';
import { getLeaderboard } from '../services/awardsService';

export const getLeaderboardController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const regionIdParam = req.query.regionId || req.query.region;
    const regionId =
      typeof regionIdParam === 'string' && regionIdParam.trim() !== ''
        ? regionIdParam.trim()
        : undefined;

    const leaderboard = await getLeaderboard(regionId);
    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};
