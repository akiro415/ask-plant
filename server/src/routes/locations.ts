import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// 조회는 로그인한 사용자라면 ADMIN/STAFF/CUSTOMER 누구나 가능, 생성/수정/삭제는 ADMIN/STAFF만 가능(RBAC).
router.use(authenticate);

router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);
router.post('/', requireRole('ADMIN', 'STAFF'), locationController.create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), locationController.update);
router.delete('/:id', requireRole('ADMIN', 'STAFF'), locationController.remove);

export default router;
