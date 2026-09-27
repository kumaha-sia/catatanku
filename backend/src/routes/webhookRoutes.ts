import express from 'express';
import { handleOpenWaWebhook } from '../controllers/webhookController';

const router = express.Router();

// Webhook endpoint for OpenWA
router.post('/wa', handleOpenWaWebhook);

export default router;
