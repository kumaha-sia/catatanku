import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import fs from 'fs';
import path from 'path';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = registerSchema.parse(req.body);
  
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    res.status(400);
    throw new Error('Email already exists');
  }

  const password_hash = await bcrypt.hash(password, 10);
  
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, password_hash }
    });

    const household = await tx.household.create({
      data: {
        name: `${name}'s Household`,
        owner_id: user.id
      }
    });

    await tx.householdMember.create({
      data: {
        household_id: household.id,
        user_id: user.id,
        role: 'OWNER',
        status: 'ACTIVE'
      }
    });

    const wallet = await tx.wallet.create({
      data: {
        user_id: user.id,
        name: 'Tunai',
        type: 'CASH',
        scope: 'PERSONAL'
      }
    });

    return { user, household, wallet };
  });

  const token = jwt.sign({ userId: result.user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    status: 'success',
    data: {
      user: { id: result.user.id, name: result.user.name, email: result.user.email, avatarUrl: result.user.avatar_url, role: result.user.role },
      token
    }
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  res.status(200).json({
    status: 'success',
    data: {
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url, role: user.role },
      token
    }
  });
});

import { AuthRequest } from '../middlewares/authMiddleware';

// @desc    Upload avatar
// @route   PUT /api/v1/auth/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  const avatarUrl = `/uploads/${req.file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar_url: avatarUrl }
  });

  res.status(200).json({
    status: 'success',
    data: {
      avatarUrl: updatedUser.avatar_url
    }
  });
});

// @desc    Update Profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { name, whatsapp, reminder_enabled, reminder_time } = req.body;

  const dataToUpdate: any = {};

  if (name !== undefined) {
    dataToUpdate.name = name;
  }
  if (whatsapp !== undefined) {
    dataToUpdate.whatsapp = whatsapp || null;
  }
  if (reminder_enabled !== undefined) {
    dataToUpdate.reminder_enabled = reminder_enabled;
  }
  if (reminder_time !== undefined) {
    dataToUpdate.reminder_time = reminder_time;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: dataToUpdate
  });

  res.status(200).json({
    status: 'success',
    data: {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatar_url,
      whatsapp: updatedUser.whatsapp,
      reminder_enabled: updatedUser.reminder_enabled,
      reminder_time: updatedUser.reminder_time,
      role: updatedUser.role
    }
  });
});


// --- WhatsApp Binding ---

export const generateWaBindToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401); throw new Error('Not authorized');
  }

  const token = 'BIND-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      wa_bind_token: token,
      wa_bind_expires_at: expiresAt
    }
  });

  res.status(200).json({ status: 'success', data: { token } });
});

export const checkWaBindStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401); throw new Error('Not authorized');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404); throw new Error('User not found');
  }

  // If whatsapp is filled and token is cleared, it means webhook succeeded
  if (user.whatsapp && !user.wa_bind_token) {
    res.status(200).json({ status: 'success', data: { whatsapp: user.whatsapp } });
  } else {
    res.status(202).json({ status: 'pending', message: 'Waiting for WhatsApp binding' });
  }
});

export const unbindWa = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401); throw new Error('Not authorized');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { whatsapp: null, wa_lid: null, wa_bind_token: null, wa_bind_expires_at: null }
  });

  res.status(200).json({ status: 'success', message: 'WhatsApp disconnected' });
});

export const deleteAvatar = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (user?.avatar_url) {
    const filename = path.basename(user.avatar_url);
    const filePath = path.join(__dirname, '../../uploads', filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
  await prisma.user.update({
    where: { id: userId },
    data: { avatar_url: null }
  });
  res.status(200).json({ status: 'success', message: 'Avatar deleted' });
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Password saat ini dan password baru wajib diisi');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('Password baru minimal 6 karakter');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) {
    res.status(400);
    throw new Error('Password saat ini salah');
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password_hash: newHash }
  });

  res.status(200).json({ status: 'success', message: 'Password berhasil diubah' });
});
