import { Router } from 'express';
import { plantController } from '../controllers/plant.controller';

const router = Router();

router.get('/', plantController.getAll);
router.get('/:id', plantController.getById);
router.post('/', plantController.create);
router.put('/:id', plantController.update);
router.delete('/:id', plantController.delete);

export default router;
