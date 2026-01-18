import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';

const router = Router();

// Route to settle x402 payments
// POST /payment/settle
router.post('/settle', paymentController.settle);

export default router;
