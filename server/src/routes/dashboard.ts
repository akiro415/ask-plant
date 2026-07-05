import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// 대시보드 요약은 ADMIN/STAFF만 조회 가능(RBAC) — CUSTOMER는 본인 소유 데이터가 아닌 전체 집계를 볼 필요가 없다.
router.use(authenticate);
router.get('/', requireRole('ADMIN', 'STAFF'), dashboardController.getSummary);

export default router;
