import { Response, NextFunction } from 'express';
import prisma from '../db';
import { AuthRequest } from './authMiddleware';

export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (!user || user.role !== 'ADMIN') {
    res.status(403).json({ status: 'error', message: 'Admin access required' });
    return;
  }

  next();
};
