import { Router } from 'express';
import { publicController } from '../controllers/public.controller';

const router = Router();

// 인증 미들웨어를 적용하지 않는다 — QR 스캔 후 비로그인 사용자가 바로 조회할 수 있어야 한다.
router.get('/plants', publicController.listPlants);
router.get('/plants/:qrCode', publicController.getPlantByQrCode);
router.post('/order-request', publicController.createOrderRequest);

export default router;
