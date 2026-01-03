import logger from '../../../utils/logger';

export class FacilitatorClient {
    private baseUrl: string;

    constructor(baseUrl: string = 'https://mock-facilitator.x402.org') {
        this.baseUrl = baseUrl;
    }

    async requestQuote(tokenIn: string, tokenOut: string, amount: string) {
        logger.info(`[Facilitator] Requesting quote for ${amount} ${tokenIn} -> ${tokenOut}`);
        // Mock response
        return {
            quoteId: 'quote_' + Date.now(),
            rate: 1.05,
            estimatedOutput: parseFloat(amount) * 1.05,
            facilitatorAddress: '0xFacilitatorAddress123'
        };
    }

    async submitPaymentProof(txHash: string) {
        logger.info(`[Facilitator] Submitting payment proof: ${txHash}`);
        return { verified: true };
    }
}
