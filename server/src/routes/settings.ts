import { Router } from 'express';
import { settingsController } from '../controllers/settings.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', requireRole('ADMIN', 'STAFF'), settingsController.get);
router.put('/', requireRole('ADMIN'), settingsController.update);

export default router;
