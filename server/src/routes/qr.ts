import { Router } from 'express';
import { qrController } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/list', qrController.list);
router.get('/preview/:plantId', qrController.preview);

export default router;
