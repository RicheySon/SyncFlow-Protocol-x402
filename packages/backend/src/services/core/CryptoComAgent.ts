import { ethers } from 'ethers';
import { Client, Token, Transaction, Wallet } from '@crypto.com/developer-platform-client';
import { Facilitator, CronosNetwork } from '@crypto.com/facilitator-client';
import logger from '../../utils/logger';

/**
 * CryptoComAgent - A high-level wrapper to enable autonomous execution
 * for AI Agents using the Crypto.com Developer Platform & Facilitator SDKs.
 */
export class CryptoComAgent {
    private signer: ethers.Wallet;
    private facilitator: Facilitator;

    constructor(privateKey: string, network: CronosNetwork = CronosNetwork.CronosTestnet) {
        const provider = new ethers.JsonRpcProvider(process.env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org');
        this.signer = new ethers.Wallet(privateKey, provider);
        this.facilitator = new Facilitator({ network });

        logger.info(`✨ CryptoComAgent initialized for address: ${this.signer.address}`);
    }

    /**
     * The core "Execute" method requested for the Agent SDK functionality.
     * Maps high-level intent to on-chain actions.
     */
    async execute(action: string, params: any): Promise<any> {
        logger.info(`🤖 Agent Executing Action: ${action}`, params);

        switch (action.toLowerCase()) {
            case 'transfer':
            case 'pay':
            case 'token_transfer':
                return this.executeX402Payment(params);

            case 'get_balance':
                return this.getBalance(params.address || this.signer.address);

            default:
                throw new Error(`Execution failed: Action '${action}' not supported by this agent.`);
        }
    }

    /**
     * Autonomous X402 Payment Settlement
     */
    private async executeX402Payment(params: { to: string, amount: string, token?: string }) {
        const amountUnits = (parseFloat(params.amount) * 1e6).toString(); // Assuming 6 decimals for TCRO/USDC settlement demo

        try {
            // 1. Generate Payment Header (Auth)
            const header = await this.facilitator.generatePaymentHeader({
                signer: this.signer,
                to: params.to,
                value: amountUnits,
            });

            // 2. Build Requirements (Standard for Protocol)
            const requirements = this.facilitator.generatePaymentRequirements({
                payTo: params.to,
                description: `Autonomous transfer from AI Agent`,
                maxAmountRequired: amountUnits,
            });

            // 3. Build Verify Request
            const body = this.facilitator.buildVerifyRequest(header, requirements);

            // 4. Settle on Blockchain (Execution)
            const result = await this.facilitator.settlePayment(body);

            return {
                status: 'success',
                txHash: (result as any).txHash,
                action: 'transfer',
                amount: params.amount,
                recipient: params.to
            };
        } catch (error: any) {
            logger.error('Agent Execution Error:', error);
            throw new Error(`Blockchain execution failed: ${error.message}`);
        }
    }

    private async getBalance(address: string) {
        const balance = await Wallet.balance(address);
        return balance.data;
    }
}
