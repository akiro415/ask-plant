import { Router } from 'express';
import { plantController } from '../controllers/plant.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// 모든 Plant API는 인증이 필요하다. CUSTOMER는 서비스 레이어에서 본인 소유로 제한된다.
router.use(authenticate);

router.get('/', plantController.getAll);
router.get('/:id', plantController.getById);
router.post('/', plantController.create);
router.put('/:id', plantController.update);
router.delete('/:id', plantController.remove);

export default router;
