import { Signer } from 'ethers';

export interface SyncFlowConfig {
    apiKey: string;
    baseUrl?: string;
    signer?: Signer; // Optional ethers.js signer for x402 payments
}

export interface PaymentChallenge {
    x402Version: number;
    error: string;
    accepts: PaymentOption[];
}

export interface PaymentOption {
    scheme: string;
    network: string;
    asset: string;
    payTo: string;
    maxAmountRequired: string;
    maxTimeoutSeconds: number;
    description: string;
    extra: {
        paymentId: string;
    };
}

export interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
    walletAddress?: string;
}

export interface Workflow {
    id: string;
    name: string;
    status: string;
    steps: any[];
}
