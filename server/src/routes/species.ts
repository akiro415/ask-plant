import { Router } from 'express';
import { speciesController } from '../controllers/species.controller';

const router = Router();

router.get('/', speciesController.getAll);

export default router;
