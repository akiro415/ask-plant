import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', requireRole('CUSTOMER'), dashboardController.getMySummary);
router.get('/', requireRole('ADMIN', 'STAFF'), dashboardController.getSummary);

export default router;
