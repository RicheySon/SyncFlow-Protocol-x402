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
                        const option = challenge.accepts[0];

                        // 1. Execute Payment on Blockchain (Standard Tx)
                        console.log(`💸 Signing Payment of ${option.maxAmountRequired} to ${option.payTo}...`);
                        const txHash = await this.handleBlockchainPayment(challenge);
                        console.log(`✅ Payment Sent. Hash: ${txHash}`);

                        // 2. Settle Payment with Backend
                        // We send the txHash as proof
                        await this.api.post('/payment/settle', {
                            paymentId: option.extra.paymentId,
                            txHash: txHash,
                            chainId: option.network === 'cronos' ? 338 : 338 // Default to Cronos Testnet
                        });

                        // 3. Retry Original Request with Payment Proof
                        if (!originalRequest.headers) {
                            originalRequest.headers = new axios.AxiosHeaders();
                        }
                        // Use the TxHash as the proof of payment in the retry
                        originalRequest.headers['x-payment-proof'] = txHash;
                        originalRequest.headers['x-payment-id'] = option.extra.paymentId;

                        console.log('✅ Payment Settled. Retrying request...');
                        return this.api(originalRequest);

                    } catch (payErr: any) {
                        console.error('❌ Payment Failed:', payErr);
                        return Promise.reject(new Error(`Payment Failed: ${payErr.message}`));
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
        const option: PaymentOption = challenge.accepts[0];

        try {
            // Parse Amount (Assuming string '0.01')
            const amount = BigInt(Math.floor(parseFloat(option.maxAmountRequired) * 1e18)); // Assuming 18 decimals (TCRO)
            // Note: In prod, use proper units util

            // Simple Transfer
            console.log(`Sending Transaction -> To: ${option.payTo}, Value: ${amount.toString()}`);
            const tx = await this.signer.sendTransaction({
                to: option.payTo,
                value: amount
            });

            console.log('Transaction sent:', tx.hash);
            // await tx.wait(); // SKIP WAIT to support "Hot Wallet" and other read-flakey providers
            return tx.hash;

        } catch (error: any) {
            console.error('Blockchain payment error:', error);
            throw new Error(`Tx Error: ${error.message}`);
        }
    }
}
