import { Router } from 'express';
import { speciesController } from '../controllers/species.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

// 조회는 로그인한 사용자라면 ADMIN/STAFF/CUSTOMER 누구나 가능, 생성/수정/삭제는 ADMIN/STAFF만 가능(RBAC).
router.use(authenticate);

router.get('/', speciesController.getAll);
router.get('/:id', speciesController.getById);
router.post('/', requireRole('ADMIN', 'STAFF'), speciesController.create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), speciesController.update);
router.delete('/:id', requireRole('ADMIN', 'STAFF'), speciesController.remove);

export default router;
