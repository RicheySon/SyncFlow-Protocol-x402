import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service';
import { Contract, CronosNetwork } from '@crypto.com/facilitator-client';

// Configuration
// 1000000 = 1.0 USDC (6 decimals)
// We'll set it to 0.01 USDC -> 10000
const REQUIRED_PRICE = '10000';
const NETWORK = (process.env.X402_NETWORK ?? 'cronos-testnet') as CronosNetwork;
const PAY_TO = process.env.X402_RECEIVER_ADDRESS || '0x0000000000000000000000000000000000000000';

// Determine asset based on network
const ASSET = NETWORK === 'cronos-mainnet'
    ? Contract.USDCe
    : Contract.DevUSDCe; // 0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0

export const x402Middleware = (req: Request, res: Response, next: NextFunction) => {
    // 1. Check for Payment ID
    const paymentId = (req.header('x-payment-id') ?? '').trim();

    // 2. Verify Payment Status
    if (paymentId && paymentService.isPaid(paymentId)) {
        // Payment valid! Proceed.
        return next();
    }

    // 3. Not Paid? Generate new ID and Challenge
    const newPaymentId = paymentService.generatePaymentId();

    // Read config dynamically to ensure env vars are loaded
    const payToAddress = process.env.X402_RECEIVER_ADDRESS;
    if (!payToAddress) {
        console.error('❌ X402 Config Error: X402_RECEIVER_ADDRESS is not set!');
    }
    const finalPayTo = payToAddress || '0x0000000000000000000000000000000000000000';

    console.log(`🔒 Generating x402 Challenge. PayTo: ${finalPayTo}, Price: ${REQUIRED_PRICE}`);

    const accepts = {
        scheme: 'exact',
        network: NETWORK,
        asset: ASSET,
        payTo: finalPayTo,
        maxAmountRequired: REQUIRED_PRICE,
        maxTimeoutSeconds: 300,
        description: 'SyncFlow Agent Interaction',
        mimeType: 'application/json',
        resource: req.originalUrl,
        extra: { paymentId: newPaymentId }
    };

    const response = {
        x402Version: 1,
        error: 'Payment Required',
        accepts: [accepts]
    };

    // Return 402 with challenge
    res.status(402).json(response);
};
