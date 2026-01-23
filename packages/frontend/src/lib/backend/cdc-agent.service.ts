import { getCryptoComClient, isCryptoComConfigured } from '../cryptocom-client';
// import OpenAI from 'openai';
// import { GoogleGenerativeAI } from '@google/generative-ai';
import { X402Handler } from './core/x402/X402Handler';
import { prisma } from '../prisma';
import { ethers } from 'ethers';

export class CdcAgentService {
    // private openai: OpenAI | null = null;
    // private gemini: GoogleGenerativeAI | null = null;
    // private activeAI: 'gemini' | 'openai' | 'none' = 'none';
    private initialized = false;
    private cryptoComAvailable = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            // Check Crypto.com SDK availability
            this.cryptoComAvailable = isCryptoComConfigured();
            if (this.cryptoComAvailable) {
                console.log('✅ Crypto.com Developer Platform Client configured');
                this.initialized = true;
            } else {
                console.warn('⚠️  Crypto.com SDK not configured - blockchain features limited');
            }

            // AI Providers Disabled (Quota Issues)
            /*
            const GEMINI_KEY = process.env.GEMINI_API_KEY;
            const OPENAI_KEY = process.env.OPENAI_API_KEY;

            if (OPENAI_KEY) {
                this.openai = new OpenAI({ apiKey: OPENAI_KEY });
                console.log('✅ OpenAI Client initialized');
            }

            if (GEMINI_KEY) {
                this.gemini = new GoogleGenerativeAI(GEMINI_KEY);
                console.log('✅ Google Gemini AI initialized');
            }

            if (this.openai) {
                this.activeAI = 'openai';
            } else if (this.gemini) {
                this.activeAI = 'gemini';
            }
            */

        } catch (error) {
            console.error('Error initializing CdcAgentService:', error);
            this.initialized = false;
        }
    }

    async processMessage(message: string, context?: any, userId?: string): Promise<string> {
        if (!this.cryptoComAvailable) {
            return `[Setup Required]: Please configure NEXT_PUBLIC_CRYPTOCOM_API_KEY to use blockchain features.`;
        }

        try {
            const lowerMessage = message.toLowerCase();

            // 1. Simple Command Parsing (Regex/Keyword based replacement for AI)

            // Check Balance
            if (lowerMessage.includes('balance') || lowerMessage.includes('how much')) {
                // Extract address if present (simple 0x regex)
                const addressMatch = message.match(/0x[a-fA-F0-9]{40}/);
                const address = addressMatch ? addressMatch[0] : null;

                if (address) {
                    const client = getCryptoComClient();
                    const res = await client.Wallet.balance(address);
                    return `Balance for ${address}:\n${JSON.stringify((res as any).data, null, 2)}`;
                } else {
                    return "Please provide a wallet address (0x...) to check the balance.";
                }
            }

            // Get Transaction
            if (lowerMessage.includes('transaction') || lowerMessage.includes('tx')) {
                const txMatch = message.match(/0x[a-fA-F0-9]{64}/);
                const txHash = txMatch ? txMatch[0] : null;

                if (txHash) {
                    const client = getCryptoComClient();
                    const res = await client.Transaction.getTransactionByHash(txHash);
                    return `Transaction Details:\n${JSON.stringify((res as any).data, null, 2)}`;
                }
            }

            // Latest Block
            if (lowerMessage.includes('latest block') || lowerMessage.includes('current block')) {
                const client = getCryptoComClient();
                const res = await client.Block.getBlockByTag('latest');
                return `Latest Block Information:\n${JSON.stringify((res as any).data, null, 2)}`;
            }

            // Default Response
            return `**SyncFlow AI (Lite Mode)**\n\nI am running in local mode using only the **Crypto.com Developer Platform SDK**.\n\nAvailable commands:\n• "Check balance of 0x..."\n• "Get info for tx 0x..."\n• "Show latest block"`;

        } catch (error: any) {
            console.error('Error processing message:', error);
            return `[Error]: ${error.message || 'Failed to process request'}`;
        }
    }
}
