import { Router } from 'express';
import { getHouseholds, getMembers, inviteMember, removeMember, leaveHousehold, generateInviteLink, joinHousehold, acceptHousehold, rejectHousehold } from '../controllers/householdController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getHouseholds);
router.post('/join', joinHousehold);
router.get('/:householdId/members', getMembers);
router.post('/:householdId/invite', inviteMember);
router.post('/:householdId/accept', acceptHousehold);
router.post('/:householdId/reject', rejectHousehold);
router.get('/:householdId/invite-link', generateInviteLink);
router.delete('/:householdId/members/:memberId', removeMember);
router.post('/:householdId/leave', leaveHousehold);

export default router;
