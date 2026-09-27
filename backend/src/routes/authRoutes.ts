import { Router } from 'express';
import { register, login, uploadAvatar, updateProfile, generateWaBindToken, checkWaBindStatus, unbindWa } from '../controllers/authController';
import { validate } from '../middlewares/validate';
import { registerSchema, loginSchema } from '../validators/auth.schema';

import { authenticate } from '../middlewares/authMiddleware';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Setup multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'));
    }
  }
});

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.put('/avatar', authenticate, upload.single('avatar'), uploadAvatar);
router.put('/profile', authenticate, updateProfile);


router.post('/wa/bind/generate', authenticate, generateWaBindToken);
router.get('/wa/bind/status', authenticate, checkWaBindStatus);
router.post('/wa/unbind', authenticate, unbindWa);

export default router;

