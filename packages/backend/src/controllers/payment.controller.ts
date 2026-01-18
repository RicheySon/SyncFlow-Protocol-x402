import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';

export class PaymentController {
    /**
     * Settle a payment using the payment proof
     * POST /payment/settle
     */
    async settle(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('💰 Settle Request Body:', JSON.stringify(req.body, null, 2));
            const { paymentId, paymentHeader, paymentRequirements } = req.body;

            if (!paymentId || !paymentHeader || !paymentRequirements) {
                console.error('❌ Missing params:', { paymentId: !!paymentId, header: !!paymentHeader, reqs: !!paymentRequirements });
                return res.status(400).json({
                    error: 'Missing required parameters',
                    required: ['paymentId', 'paymentHeader', 'paymentRequirements']
                });
            }

            const result = await paymentService.settlePayment(paymentId, paymentHeader, paymentRequirements);
            console.log('✅ Settle Result:', result);

            if (!result.ok) {
                console.error('❌ Settle Failed:', result.error);
                // Return 500 for server/upstream errors to distinguish from 400 validation
                // But typically validation errors are 400. Let's keep 400 but log it.
                return res.status(400).json({
                    error: result.error
                });
            }

            // Payment successful!
            res.json({
                ok: true,
                txHash: result.txHash,
                message: 'Payment settled successfully'
            });

        } catch (error) {
            console.error('🔥 Settle Exception:', error);
            next(error);
        }
    }
}

export const paymentController = new PaymentController();
