import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    // Get system default categories (user_id = null) and user's custom categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { user_id: null },
          { user_id: userId }
        ]
      }
    });

    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Unauthorized' });
      return;
    }

    const { name, type, icon } = req.body;

    const category = await prisma.category.create({
      data: {
        user_id: userId,
        name,
        type,
        icon
      }
    });

    res.status(201).json({ status: 'success', data: category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
