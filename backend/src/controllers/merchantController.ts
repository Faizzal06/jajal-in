import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import { registerMerchant } from '../services/merchantService';

export const registerMerchantController = async (
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

    const {
      name,
      description,
      lat,
      lng,
      regionId,
      categoryId,
      contactWhatsApp,
      products,
      adPackageId,
      adPaymentProofUrl,
    } = req.body || {};

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
      !contactWhatsApp ||
      typeof contactWhatsApp !== 'string' ||
      contactWhatsApp.trim() === '' ||
      lat === undefined ||
      lat === null ||
      lng === undefined ||
      lng === null
    ) {
      const error: any = new Error(
        'Missing required fields: name, description, lat, lng, regionId, categoryId, and contactWhatsApp are required'
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

    if (products !== undefined && !Array.isArray(products)) {
      const error: any = new Error('Invalid products format: products must be an array');
      error.statusCode = 400;
      throw error;
    }

    const result = await registerMerchant(user.id, {
      name,
      description,
      lat: latNum,
      lng: lngNum,
      regionId,
      categoryId,
      contactWhatsApp,
      products,
      adPackageId,
      adPaymentProofUrl,
    });

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
