import express from 'express';
import cors from 'cors';
import path from 'path';
import { initializeSchema } from './db/schema';
import { errorHandler } from './middleware/error';
import authRoutes from './routes/auth';
import menuRoutes from './routes/menu';
import orderRoutes from './routes/order';
import tableRoutes from './routes/table';
import sseRoutes from './routes/sse';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// 정적 파일 서빙 (업로드된 이미지)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// DB 초기화
initializeSchema();

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/sse', sseRoutes);
app.use('/api/upload', uploadRoutes);

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 에러 핸들러 (마지막에 등록)
app.use(errorHandler);

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
