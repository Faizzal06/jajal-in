import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/authGuard';
import * as adminService from '../services/adminService';

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

export const getPlaces = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search, type, page, limit } = req.query;
    const result = await adminService.getAdminPlaces({
      status: status as string,
      search: search as string,
      type: type as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPlaceDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      const error: any = new Error('Place ID is required');
      error.statusCode = 400;
      throw error;
    }
    const data = await adminService.getAdminPlaceById(id);
    res.json(data);
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      error.statusCode = 404;
      error.message = 'Place not found';
    }
    next(error);
  }
};

export const updatePlaceStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      const error: any = new Error('Status harus salah satu dari: approved, rejected, pending');
      error.statusCode = 400;
      throw error;
    }
    const adminId = req.user?.id || '';
    const data = await adminService.updatePlaceStatus(id, status, adminId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const updatePlace = async (req: AuthRequest, res: Response, NextFunction: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { name, description, status, category_id, region_id, lat, lng, media, highlights } = req.body || {};
    const adminId = req.user?.id || '';
    const data = await adminService.updatePlace(
      id,
      {
        name,
        description,
        status,
        category_id,
        region_id,
        lat: lat !== undefined ? Number(lat) : undefined,
        lng: lng !== undefined ? Number(lng) : undefined,
        media,
        highlights,
      },
      adminId
    );
    res.json(data);
  } catch (error) {
    NextFunction(error);
  }
};

export const deletePlace = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id || '';
    await adminService.deletePlace(id, adminId);
    res.json({ message: 'Tempat berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { role, search, page, limit } = req.query;
    const result = await adminService.getAdminUsers({
      role: role as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const data = await adminService.getAdminUserById(id);
    res.json(data);
  } catch (error: any) {
    if (error.code === 'PGRST116') {
      error.statusCode = 404;
      error.message = 'User not found';
    }
    next(error);
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    if (!role || !['user', 'admin', 'merchant'].includes(role)) {
      const error: any = new Error('Role harus salah satu dari: user, admin, merchant');
      error.statusCode = 400;
      throw error;
    }
    const adminId = req.user?.id || '';
    const data = await adminService.updateUserRole(id, role, adminId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const banUserController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;
    if (!reason) {
      const error: any = new Error('Alasan ban wajib diisi');
      error.statusCode = 400;
      throw error;
    }
    const adminId = req.user?.id || '';
    const data = await adminService.banUser(id, reason, adminId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const unbanUserController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id || '';
    const data = await adminService.unbanUser(id, adminId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getMerchants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, search, page, limit } = req.query;
    const result = await adminService.getAdminMerchants({
      status: status as string,
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const approveMerchant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id || '';
    const data = await adminService.approveMerchant(id, adminId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const rejectMerchant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id || '';
    const data = await adminService.rejectMerchant(id, adminId);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const getContributions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { search, page, limit } = req.query;
    const result = await adminService.getAdminContributions({
      search: search as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteContribution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const adminId = req.user?.id || '';
    await adminService.deleteContribution(id, adminId);
    res.json({ message: 'Kontribusi berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await adminService.getAuditLog({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};
