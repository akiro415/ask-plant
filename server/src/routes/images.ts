import { Router } from 'express';
import { imageController } from '../controllers/image.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

/** GET /images/recent?limit=5 — 대시보드 최신 사진 */
router.get('/recent', imageController.getRecent);
/** GET /images — 사진관리 화면 전체 목록 */
router.get('/', imageController.getAll);
router.put('/:id', imageController.update);
router.delete('/:id', imageController.remove);

export default router;
