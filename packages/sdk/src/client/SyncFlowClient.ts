import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { Contract, Signer } from 'ethers';
import { SyncFlowConfig, PaymentChallenge, PaymentOption } from '../types';

const ERC20_ABI = [
    'function transfer(address to, uint256 amount) returns (bool)'
];

// Extend AxiosRequestConfig to include retry flag
interface CustomRetryConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export class SyncFlowClient {
    protected api: AxiosInstance;
    protected signer?: Signer;

    constructor(config: SyncFlowConfig) {
        this.signer = config.signer;

        this.api = axios.create({
            baseURL: config.baseUrl || 'http://localhost:3001',
            headers: {
                'Authorization': `Bearer ${config.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Add Response Interceptor for x402 Payment
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config as CustomRetryConfig;

                // Handle 402 Payment Required
                if (error.response?.status === 402 && !originalRequest._retry) {
                    if (!this.signer) {
                        return Promise.reject(new Error("x402 Payment Required: No signer provided to SDK"));
                    }

                    originalRequest._retry = true;

                    try {
                        console.log('🔒 402 Payment Challenge user intercepted. Handling payment...');
                        const challenge = error.response.data as PaymentChallenge;

                        // 1. Execute Payment on Blockchain
                        const paymentProof = await this.handleBlockchainPayment(challenge);

                        // 2. Settle Payment with Backend
                        // Backend expects: { paymentId, paymentHeader, paymentRequirements }
                        const option = challenge.accepts[0];
                        await this.api.post('/payment/settle', {
                            paymentId: option.extra.paymentId,
                            paymentHeader: paymentProof, // For ExactEvmScheme, this is the txHash (or encoded)
                            paymentRequirements: option // Pass back the requirements provided
                        });

                        // 3. Retry Original Request with Payment ID
                        if (!originalRequest.headers) {
                            originalRequest.headers = new axios.AxiosHeaders();
                        }
                        originalRequest.headers['x-payment-id'] = option.extra.paymentId;

                        console.log('✅ Payment Settled. Retrying request...');
                        return this.api(originalRequest);

                    } catch (payErr: any) {
                        console.error('❌ Payment Failed:', payErr);

                        let detail = payErr.message;
                        if (payErr.response && payErr.response.data) {
                            const serverData = typeof payErr.response.data === 'object'
                                ? JSON.stringify(payErr.response.data)
                                : payErr.response.data;
                            detail += ` | Server: ${serverData}`;
                        }

                        return Promise.reject(new Error(`Payment Failed: ${detail}`));
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * Handles the blockchain transaction for the payment challenge
     */
    private async handleBlockchainPayment(challenge: PaymentChallenge): Promise<string> {
        if (!this.signer) throw new Error("No signer available");

        // Use the first payment option
        const option: PaymentOption = challenge.accepts[0];

        // Use the official Facilitator client to generate the payment header (proof)
        // This handles EIP-3009 (Transfer with Authorization) or standard transfers as required
        try {
            // Import dynamically or assume it's available since it's a dependency
            const { Facilitator } = await import('@crypto.com/facilitator-client');

            const facilitator = new Facilitator({ network: option.network as any }); // Cast network to avoid simple string type issues

            console.log(`💸 Generating Payment Header via Facilitator for ${option.maxAmountRequired} units to ${option.payTo}...`);

            const paymentHeader = await facilitator.generatePaymentHeader({
                to: option.payTo,
                value: option.maxAmountRequired,
                asset: option.asset,
                signer: this.signer,
                validBefore: Math.floor(Date.now() / 1000) + (option.maxTimeoutSeconds || 300),
                validAfter: 0
            });

            console.log('✅ Payment Header Generated:', paymentHeader);
            return paymentHeader;

        } catch (error: any) {
            console.error('Failed to generate payment header:', error);
            // Fallback to manual transfer ONLY if Facilitator fails (unlikely if setup is correct)
            // But usually, we should just throw
            throw new Error(`Facilitator Error: ${error.message}`);
        }
    }
}
