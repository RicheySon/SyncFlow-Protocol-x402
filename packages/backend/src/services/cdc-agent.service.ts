import { Client, Wallet, Transaction, Block } from '@crypto.com/developer-platform-client';
import { env } from '../config/env.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * SyncFlow AI Agent Service
 * Uses Crypto.com Developer Platform Client + AI (Gemini/OpenAI) for natural language blockchain queries
 */
export class CdcAgentService {
    private openai: OpenAI | null = null;
    private gemini: GoogleGenerativeAI | null = null;
    private activeAI: 'gemini' | 'openai' | 'none' = 'none';
    private initialized = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            // Initialize Developer Platform Client
            if (env.CDC_DASHBOARD_API_KEY) {
                Client.init({
                    apiKey: env.CDC_DASHBOARD_API_KEY,
                    ...(env.CDC_PROVIDER_URL && { provider: env.CDC_PROVIDER_URL })
                });
                console.log('✅ Crypto.com Developer Platform Client initialized');
            }

            // Prefer Gemini (FREE) over OpenAI
            if (env.GEMINI_API_KEY) {
                this.gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
                this.activeAI = 'gemini';
                console.log('✅ Google Gemini AI initialized (FREE tier)');
            } else if (env.OPENAI_API_KEY) {
                this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
                this.activeAI = 'openai';
                console.log('✅ OpenAI Client initialized');
            } else {
                console.log('⚠️  No AI provider configured - direct mode only');
            }

            this.initialized = !!env.CDC_DASHBOARD_API_KEY;
        } catch (error) {
            console.error('Error initializing CdcAgentService:', error);
            this.initialized = false;
        }
    }

    /**
     * Get AI interpretation using available provider
     */
    private async getAIResponse(message: string): Promise<string> {
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const systemPrompt = `You are a helpful blockchain assistant for the Cronos network.
Current Date: ${currentDate}

You can help users:
- Get the latest block information
- Check wallet balances (provide an address)
- View transaction details (provide a tx hash)
- General blockchain questions

Respond conversationally. If a user asks for blockchain data but doesn't provide required info (like an address), politely ask for it.`;

        try {
            if (this.activeAI === 'gemini' && this.gemini) {
                const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
                const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
                const response = await result.response;
                return response.text();
            } else if (this.activeAI === 'openai' && this.openai) {
                const completion = await this.openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: message }
                    ],
                    temperature: 0.7,
                    max_tokens: 300
                });
                return completion.choices[0]?.message?.content || '';
            }

            return ''; // No AI available
        } catch (error: any) {
            // Handle quota/rate limit errors gracefully
            if (error.code === 'insufficient_quota' || error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') {
                console.warn(`⚠️  ${this.activeAI} quota/rate limit exceeded - falling back to direct mode`);
                return '';
            }
            console.error(`${this.activeAI} error:`, error.message);
            return '';
        }
    }

    /**
     * Process a natural language message and execute blockchain operations
     */
    async processMessage(message: string): Promise<string> {
        if (!this.initialized) {
            return `[Setup Required]: Please configure CDC_DASHBOARD_API_KEY in your .env file.`;
        }

        try {
            const lowerMessage = message.toLowerCase();
            let aiResponse = '';

            // Try AI interpretation if available
            if (this.activeAI !== 'none') {
                aiResponse = await this.getAIResponse(message);
            }

            // PRIORITY: Check blockchain queries FIRST (before AI response)
            // This ensures direct commands work even when AI is active

            // Check if user wants latest block
            if (lowerMessage.includes('latest block') || lowerMessage.includes('current block')) {
                try {
                    const response = await Block.getBlockByTag('latest');
                    return `Latest Block Information:\n${JSON.stringify(response.data, null, 2)}`;
                } catch (error: any) {
                    return `I tried to fetch the latest block but encountered an error: ${error.message}`;
                }
            }

            // Check if user wants balance (flexible address matching)
            const addressMatch = message.match(/0x[a-fA-F0-9]{38,42}/);
            if ((lowerMessage.includes('balance') || lowerMessage.includes('wallet')) && addressMatch) {
                try {
                    const address = addressMatch[0];
                    console.log(`🔍 Fetching balance for address: ${address}`);
                    const response = await Wallet.balance(address);
                    const balance = response.data;
                    return `Balance for ${address}:\n${JSON.stringify(balance, null, 2)}`;
                } catch (error: any) {
                    console.error('Balance fetch error:', error);
                    return `I tried to fetch the balance but encountered an error: ${error.message}`;
                }
            }

            // Check if user wants transaction details
            const txHashMatch = message.match(/0x[a-fA-F0-9]{64}/);
            if ((lowerMessage.includes('transaction') || lowerMessage.includes('tx')) && txHashMatch) {
                try {
                    const txHash = txHashMatch[0];
                    const response = await Transaction.getTransactionByHash(txHash);
                    return `Transaction Details:\n${JSON.stringify(response.data, null, 2)}`;
                } catch (error: any) {
                    return `I tried to fetch transaction details but encountered an error: ${error.message}`;
                }
            }

            // Return AI response if available, otherwise provide helpful fallback
            if (aiResponse) {
                return aiResponse;
            }

            // No AI available - provide direct command help
            const aiStatus = this.activeAI === 'none'
                ? 'No AI provider configured. Add GEMINI_API_KEY (free) or OPENAI_API_KEY to .env for conversational mode.'
                : `${this.activeAI === 'gemini' ? 'Gemini' : 'OpenAI'} temporarily unavailable.`;

            return `I can help you with:\n• "latest block" - Get current block info\n• "balance 0x..." - Check wallet balance\n• "tx 0x..." - View transaction details\n\n${aiStatus}`;

        } catch (error: any) {
            console.error('Error processing message:', error);
            return `[Error]: ${error.message || 'Failed to process your request'}`;
        }
    }
}
