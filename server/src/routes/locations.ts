import { Router } from 'express';
import { locationController } from '../controllers/location.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', locationController.getAll);
router.get('/:id', locationController.getById);
router.post('/', locationController.create);
router.put('/:id', locationController.update);
router.delete('/:id', locationController.remove);

export default router;
