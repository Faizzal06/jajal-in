import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import * as settingsService from '../services/settingsService';

export const getHeroSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await settingsService.getHeroSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateHeroSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const adminId = req.user.id;
    const { hero_badge, hero_title, hero_subtitle, hero_image_url } = req.body;

    const updated = await settingsService.updateHeroSettings(adminId, {
      hero_badge: typeof hero_badge === 'string' ? hero_badge.trim() : undefined,
      hero_title: typeof hero_title === 'string' ? hero_title.trim() : undefined,
      hero_subtitle: typeof hero_subtitle === 'string' ? hero_subtitle.trim() : undefined,
      hero_image_url: typeof hero_image_url === 'string' ? hero_image_url.trim() : undefined,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
};
