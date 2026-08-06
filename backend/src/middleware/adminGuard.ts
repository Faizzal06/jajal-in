import { Request, Response, NextFunction } from 'express';
import { requireAuth, AuthRequest } from './authGuard';
import { supabase } from '../lib/supabase';

export interface AdminRequest extends AuthRequest {
  user?: any & { role: string };
}

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, async (authError?: any) => {
    if (authError) return next(authError);
    if (res.headersSent) return;

    const authReq = req as AuthRequest;
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', authReq.user.id)
      .single();

    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    next();
  });
};
