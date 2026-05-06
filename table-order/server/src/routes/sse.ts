import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { sseManager } from '../utils/sse-manager';

const router = Router();

// GET /api/sse/orders — SSE 실시간 주문 스트림 (관리자)
router.get('/orders', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  const storeId = req.user!.storeId;
  const clientId = uuidv4();

  // SSE 헤더 설정
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  // 연결 확인 이벤트
  res.write(`event: connected\n`);
  res.write(`data: ${JSON.stringify({ clientId, storeId })}\n\n`);

  // SSE Manager에 등록
  sseManager.addClient(clientId, storeId, res);

  // Keep-alive (30초마다 핑)
  const keepAlive = setInterval(() => {
    res.write(`:keep-alive\n\n`);
  }, 30000);

  // 연결 종료 시 정리
  req.on('close', () => {
    clearInterval(keepAlive);
    sseManager.removeClient(clientId);
  });
});

export default router;
