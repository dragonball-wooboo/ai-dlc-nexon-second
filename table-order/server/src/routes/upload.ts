import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { ValidationError } from '../middleware/error';

// 허용 확장자
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(new ValidationError('허용되지 않는 파일 형식입니다 (jpg, png, gif, webp만 가능)') as any);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

const router = Router();

// POST /api/upload/image — 이미지 업로드 (관리자)
router.post('/image', authenticateToken, requireAdmin, (req: Request, res: Response, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: '파일 크기는 5MB 이하여야 합니다' });
        }
        return res.status(400).json({ error: '파일 업로드 오류가 발생했습니다' });
      }
      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({ error: '이미지 파일이 필요합니다' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(201).json({ imageUrl });
  });
});

export default router;
