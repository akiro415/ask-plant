import { Router } from 'express';
import { commonCodeController } from '../controllers/common-code.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', commonCodeController.getAll);
router.get('/groups', commonCodeController.getGroups);
router.put('/groups/:groupCode', requireRole('ADMIN', 'STAFF'), commonCodeController.updateGroup);
router.get('/:id', commonCodeController.getById);
router.post('/', requireRole('ADMIN', 'STAFF'), commonCodeController.create);
router.put('/:id', requireRole('ADMIN', 'STAFF'), commonCodeController.update);
router.delete('/:id', requireRole('ADMIN', 'STAFF'), commonCodeController.remove);

export default router;
