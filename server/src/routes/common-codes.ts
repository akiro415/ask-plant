import { Router } from 'express';
import { commonCodeController } from '../controllers/common-code.controller';

const router = Router();

router.get('/', commonCodeController.getAll);

export default router;
