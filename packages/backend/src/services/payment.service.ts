import { Facilitator, CronosNetwork, PaymentRequirements, VerifyRequest, X402VerifyResponse, X402SettleResponse } from '@crypto.com/facilitator-client';
import crypto from 'crypto';

export interface PaidRecord {
    settled: boolean;
    txHash?: string;
    at: number;
}

const paidStore = new Map<string, PaidRecord>();

export class PaymentService {
    private facilitator: Facilitator;

    constructor() {
        // Defaults to cronos-testnet
        const network = (process.env.X402_NETWORK ?? 'cronos-testnet') as CronosNetwork;
        this.facilitator = new Facilitator({ network });
    }

    generatePaymentId(): string {
        return `pay_${crypto.randomUUID()}`;
    }

    isPaid(paymentId: string): boolean {
        const record = paidStore.get(paymentId);
        // Also check expiry if needed
        return !!record?.settled;
    }

    async settlePayment(paymentId: string, paymentHeader: string, paymentRequirements: PaymentRequirements): Promise<{ ok: boolean; txHash?: string; error?: string }> {
        const body: VerifyRequest = {
            x402Version: 1,
            paymentHeader,
            paymentRequirements,
        };

        try {
            const verify = (await this.facilitator.verifyPayment(body)) as X402VerifyResponse;
            if (!verify.isValid) {
                return { ok: false, error: 'Payment verification failed' };
            }

            const settle = (await this.facilitator.settlePayment(body)) as X402SettleResponse;
            if (settle.event !== 'payment.settled') {
                return { ok: false, error: 'Payment settlement failed' };
            }

            this.markAsPaid(paymentId, settle.txHash || '');
            return { ok: true, txHash: settle.txHash };
        } catch (error: any) {
            console.error('Payment settlement error:', error);
            return { ok: false, error: error.message };
        }
    }

    markAsPaid(paymentId: string, txHash: string) {
        paidStore.set(paymentId, { settled: true, txHash, at: Date.now() });
    }
}

export const paymentService = new PaymentService();
