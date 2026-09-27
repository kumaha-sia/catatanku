import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middlewares/authMiddleware';
import asyncHandler from 'express-async-handler';
import { z } from 'zod';

export const getHouseholds = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const memberships = await prisma.householdMember.findMany({
    where: { user_id: userId },
    include: { household: true }
  });
  
  const households = memberships.map(m => ({
    ...m.household,
    role: m.role,
    status: m.status
  }));

  res.status(200).json({ status: 'success', data: households });
});

export const getMembers = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;

  // Check if user is in this household
  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });

  if (!membership) {
    res.status(403);
    throw new Error('Access denied');
  }

  const members = await prisma.householdMember.findMany({
    where: { household_id: householdId },
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  res.status(200).json({ status: 'success', data: members });
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER')
});

export const inviteMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;
  const { email, role } = inviteSchema.parse(req.body);

  // Must be OWNER or ADMIN to invite
  const inviter = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } },
    include: { household: true }
  });

  if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
    res.status(403);
    throw new Error('Not authorized to invite');
  }

  const targetUser = await prisma.user.findUnique({ where: { email } });
  if (!targetUser) {
    // Edge Case: Unregistered User
    // For now, return 404 with a specific message that frontend can use to tell user to use link
    res.status(404);
    throw new Error('User belum terdaftar di FinBareng. Silakan gunakan Tautan Undangan.');
  }

  if (targetUser.id === userId) {
    res.status(409);
    throw new Error('Tidak bisa mengundang diri sendiri.');
  }

  const existingMember = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: targetUser.id } }
  });

  if (existingMember) {
    res.status(409);
    throw new Error(`User sudah berstatus ${existingMember.status} di keluarga ini.`);
  }

  // Check if target user is already in another family
  const targetUserHouseholds = await prisma.householdMember.findMany({
    where: { user_id: targetUser.id, status: 'ACTIVE' },
    include: { household: { include: { members: true } } }
  });

  const isInAnotherFamily = targetUserHouseholds.some(membership => 
    membership.role !== 'OWNER' || membership.household.members.length > 1
  );

  if (isInAnotherFamily) {
    res.status(409);
    throw new Error('User tersebut sudah tergabung dengan keluarga lain.');
  }

  const newMember = await prisma.householdMember.create({
    data: {
      household_id: householdId,
      user_id: targetUser.id,
      role,
      status: 'PENDING'
    }
  });

  // Create notification for the target user
  await prisma.notification.create({
    data: {
      user_id: targetUser.id,
      household_id: householdId,
      type: 'INVITATION',
      title: 'Undangan Keluarga',
      body: `Anda diundang untuk bergabung ke keluarga "${inviter.household.name}".`,
      action_url: `/family`
    }
  });

  res.status(201).json({ status: 'success', data: newMember });
});

export const removeMember = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;
  const targetMemberId = req.params.memberId as string;

  const inviter = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });

  if (!inviter || inviter.role !== 'OWNER') {
    res.status(403);
    throw new Error('Only OWNER can remove members');
  }

  const targetMember = await prisma.householdMember.findUnique({
    where: { id: targetMemberId }
  });

  if (!targetMember || targetMember.household_id !== householdId) {
    res.status(404);
    throw new Error('Member not found');
  }

  if (targetMember.user_id === userId) {
    res.status(403);
    throw new Error('Owner cannot remove themselves. Use delete household instead.');
  }

  await prisma.householdMember.delete({
    where: { id: targetMemberId }
  });

  res.status(200).json({ status: 'success', message: 'Member removed' });
});

export const leaveHousehold = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;

  const membership = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });

  if (!membership) {
    res.status(404);
    throw new Error('Membership not found');
  }

  if (membership.role === 'OWNER') {
    res.status(403);
    throw new Error('Owner tidak bisa meninggalkan keluarga. Hapus keluarga atau transfer kepemilikan.');
  }

  await prisma.householdMember.delete({
    where: { id: membership.id }
  });

  res.status(200).json({ status: 'success', message: 'Left household' });
});

export const generateInviteLink = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;

  const inviter = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } },
    include: { household: true }
  });

  if (!inviter || (inviter.role !== 'OWNER' && inviter.role !== 'ADMIN')) {
    res.status(403);
    throw new Error('Not authorized to generate invite link');
  }

  let inviteCode = inviter.household.invite_code;
  if (!inviteCode) {
    const crypto = require('crypto');
    inviteCode = crypto.randomBytes(8).toString('hex');
    await prisma.household.update({
      where: { id: householdId },
      data: { invite_code: inviteCode }
    });
  }

  res.status(200).json({ status: 'success', data: { invite_code: inviteCode } });
});

export const joinHousehold = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { code } = req.body;

  if (!code) {
    res.status(400);
    throw new Error('Invite code is required');
  }

  const household = await prisma.household.findUnique({
    where: { invite_code: code }
  });

  if (!household) {
    res.status(404);
    throw new Error('Invalid invite link');
  }

  const existingMember = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: household.id, user_id: userId! } }
  });

  if (existingMember) {
    if (existingMember.status === 'PENDING') {
      // Also check here before accepting via link if they have another family
      const userHouseholds = await prisma.householdMember.findMany({
        where: { user_id: userId!, status: 'ACTIVE' },
        include: { household: { include: { members: true } } }
      });
      if (userHouseholds.some(m => m.role !== 'OWNER' || m.household.members.length > 1)) {
        res.status(409);
        throw new Error('Anda sudah tergabung dengan keluarga lain.');
      }

      await prisma.householdMember.update({
        where: { id: existingMember.id },
        data: { status: 'ACTIVE' }
      });
      res.status(200).json({ status: 'success', message: 'Joined successfully' });
      return;
    }
    res.status(400);
    throw new Error('You are already in this household');
  }

  // Check if user is already in another family
  const userHouseholds = await prisma.householdMember.findMany({
    where: { user_id: userId!, status: 'ACTIVE' },
    include: { household: { include: { members: true } } }
  });

  if (userHouseholds.some(m => m.role !== 'OWNER' || m.household.members.length > 1)) {
    res.status(409);
    throw new Error('Anda sudah tergabung dengan keluarga lain.');
  }

  await prisma.householdMember.create({
    data: {
      household_id: household.id,
      user_id: userId!,
      role: 'MEMBER',
      status: 'ACTIVE'
    }
  });

  res.status(200).json({ status: 'success', message: 'Joined successfully' });
});

export const acceptHousehold = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;

  const existingMember = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });

  if (!existingMember || existingMember.status !== 'PENDING') {
    res.status(404);
    throw new Error('Pending invite not found');
  }

  const userHouseholds = await prisma.householdMember.findMany({
    where: { user_id: userId!, status: 'ACTIVE' },
    include: { household: { include: { members: true } } }
  });

  if (userHouseholds.some(m => m.role !== 'OWNER' || m.household.members.length > 1)) {
    res.status(409);
    throw new Error('Anda sudah tergabung dengan keluarga lain.');
  }

  await prisma.householdMember.update({
    where: { id: existingMember.id },
    data: { status: 'ACTIVE' }
  });

  res.status(200).json({ status: 'success', message: 'Invite accepted' });
});

export const rejectHousehold = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const householdId = req.params.householdId as string;

  const existingMember = await prisma.householdMember.findUnique({
    where: { household_id_user_id: { household_id: householdId, user_id: userId! } }
  });

  if (!existingMember || existingMember.status !== 'PENDING') {
    res.status(404);
    throw new Error('Pending invite not found');
  }

  await prisma.householdMember.delete({
    where: { id: existingMember.id }
  });

  res.status(200).json({ status: 'success', message: 'Invite rejected' });
});
