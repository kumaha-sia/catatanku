import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';
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
