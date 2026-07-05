import { Router } from 'express';
import { collectorProfileController } from '../controllers/collector-profile.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', collectorProfileController.getMine);
router.put('/me', collectorProfileController.upsertMine);

export default router;
