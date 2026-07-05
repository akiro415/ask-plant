import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// 사용자 관리는 시스템 ADMIN 전용 — 조회/수정/삭제 모두 requireRole('ADMIN') 적용.
router.use(authenticate, requireRole('ADMIN'));

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.put('/:id', userController.update);
router.delete('/:id', userController.remove);

export default router;
