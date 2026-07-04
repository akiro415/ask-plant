import { Router } from 'express';
import { wateringController } from '../controllers/watering.controller';

const router = Router();

router.get('/plant/:plantId', wateringController.getByPlantId);
router.post('/', wateringController.create);

export default router;
