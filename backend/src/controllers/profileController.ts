import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { getUserProfile } from '../services/profileService';

export const getProfileController = async (
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

    const profile = await getUserProfile(user.id);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};
