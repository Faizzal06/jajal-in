import { Request, Response } from 'express';
import { getRegions } from '../services/regionsService';

export const getRegionsHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentId = typeof req.query.parentId === 'string' ? req.query.parentId.trim() : undefined;
    const type = req.query.type === 'province' || req.query.type === 'regency' ? req.query.type : undefined;
    const grouped = req.query.grouped === 'true';

    const regions = await getRegions({ parentId, type, grouped });
    res.json(regions);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch regions' });
  }
};
