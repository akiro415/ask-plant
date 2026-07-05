import { Router } from 'express';
import { cartController } from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', cartController.getMyCart);
router.post('/items', cartController.addItem);
router.delete('/clear', cartController.clear);
router.put('/items/:id', cartController.updateItem);
router.delete('/items/:id', cartController.removeItem);

export default router;
