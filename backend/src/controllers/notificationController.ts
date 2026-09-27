import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { AuthRequest } from '../middlewares/authMiddleware';

const prisma = new PrismaClient();

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 50,
  });

  const unreadCount = await prisma.notification.count({
    where: { user_id: userId, is_read: false }
  });

  res.status(200).json({
    status: 'success',
    data: {
      notifications,
      unreadCount
    }
  });
});

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const id = req.params.id as string;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification || notification.user_id !== userId) {
    res.status(404);
    throw new Error('Notification not found');
  }

  const updatedNotification = await prisma.notification.update({
    where: { id },
    data: { is_read: true }
  });

  res.status(200).json({
    status: 'success',
    data: updatedNotification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;

  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  });

  res.status(200).json({
    status: 'success',
    message: 'All notifications marked as read'
  });
});
