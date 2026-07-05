import { Router } from 'express';
import { historyController } from '../controllers/history.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/** GET /histories/recent?type=REPOT&limit=5 — 대시보드 등 최신 이력 조회 */
router.get('/recent', historyController.getRecent);
router.put('/:id', historyController.update);
router.delete('/:id', historyController.remove);

export default router;
