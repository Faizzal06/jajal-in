import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { getUserProfile, updateUserProfile } from '../services/profileService';

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

export const getPublicProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const rawId = req.params.id;
    const userId = Array.isArray(rawId) ? rawId[0] : rawId;
    if (!userId) {
      const error: any = new Error('User ID is required');
      error.statusCode = 400;
      throw error;
    }

    const profile = await getUserProfile(userId);
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateProfileController = async (
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

    const { name, bio, avatar_url } = req.body || {};

    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
      const error: any = new Error('Nama tidak boleh kosong');
      error.statusCode = 400;
      throw error;
    }

    if (bio !== undefined && typeof bio === 'string' && bio.length > 200) {
      const error: any = new Error('Bio maksimal 200 karakter');
      error.statusCode = 400;
      throw error;
    }

    const updatedProfile = await updateUserProfile(user.id, {
      name,
      bio,
      avatar_url,
    });

    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

