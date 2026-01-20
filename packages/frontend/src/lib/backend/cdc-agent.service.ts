import { Client, Wallet, Transaction, Block } from '@crypto.com/developer-platform-client';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X402Handler } from './core/x402/X402Handler';

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
            const CDC_KEY = process.env.CDC_DASHBOARD_API_KEY;
            const RPC_URL = process.env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org';
            const GEMINI_KEY = process.env.GEMINI_API_KEY;
            const OPENAI_KEY = process.env.OPENAI_API_KEY;

            // Initialize Developer Platform Client
            if (CDC_KEY) {
                Client.init({
                    apiKey: CDC_KEY,
                    provider: RPC_URL
                });
                console.log('✅ Crypto.com Developer Platform Client initialized');
            }

            // AI Providers
            if (GEMINI_KEY) {
                this.gemini = new GoogleGenerativeAI(GEMINI_KEY);
                this.activeAI = 'gemini';
                console.log('✅ Google Gemini AI initialized (FREE tier)');
            } else if (OPENAI_KEY) {
                this.openai = new OpenAI({ apiKey: OPENAI_KEY });
                this.activeAI = 'openai';
                console.log('✅ OpenAI Client initialized');
            }

            this.initialized = !!CDC_KEY;
        } catch (error) {
            console.error('Error initializing CdcAgentService:', error);
            this.initialized = false;
        }
    }

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
                const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
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

            return '';
        } catch (error: any) {
            if (error.code === 'insufficient_quota' || error.status === 429) {
                console.warn(`⚠️ ${this.activeAI} quota/rate limit exceeded`);
                return '';
            }
            console.error(`${this.activeAI} error:`, error.message);
            return '';
        }
    }

    async processMessage(message: string, _context?: any): Promise<string> {
        if (!this.initialized) {
            return `[Setup Required]: Please configure CDC_DASHBOARD_API_KEY in your Vercel Environment Variables.`;
        }

        try {
            const lowerMessage = message.toLowerCase();
            let aiResponse = '';

            if (this.activeAI !== 'none') {
                aiResponse = await this.getAIResponse(message);
            }

            if (lowerMessage.includes('latest block') || lowerMessage.includes('current block')) {
                const response = await Block.getBlockByTag('latest');
                return `Latest Block Information:\n${JSON.stringify(response.data, null, 2)}`;
            }

            const addressMatch = message.match(/0x[a-fA-F0-9]{38,42}/);
            if ((lowerMessage.includes('balance') || lowerMessage.includes('wallet')) && addressMatch) {
                const address = addressMatch[0];
                const response = await Wallet.balance(address);
                return `Balance for ${address}:\n${JSON.stringify(response.data, null, 2)}`;
            }

            const txHashMatch = message.match(/0x[a-fA-F0-9]{64}/);
            if ((lowerMessage.includes('transaction') || lowerMessage.includes('tx')) && txHashMatch) {
                const txHash = txHashMatch[0];
                const response = await Transaction.getTransactionByHash(txHash);
                return `Transaction Details:\n${JSON.stringify(response.data, null, 2)}`;
            }

            const amountMatch = lowerMessage.match(/(\d+(\.\d+)?)\s*(cro|tcro)/i);
            const toAddressMatch = message.match(/0x[a-fA-F0-9]{40}/);

            if ((lowerMessage.includes('send') || lowerMessage.includes('transfer')) && amountMatch && toAddressMatch) {
                const amount = amountMatch[1];
                const recipient = toAddressMatch[0];

                const x402Handler = new X402Handler();
                const quote = await x402Handler.processPayment({
                    token: 'CRO',
                    amount: amount,
                    recipient: recipient
                });

                return JSON.stringify({
                    type: "transaction_proposal",
                    data: {
                        to: recipient,
                        amount: amount,
                        token: "CRO",
                        protocol: "x402",
                        quoteId: quote.quoteId
                    },
                    message: `I've prepared an **X402 Protocol** payment of **${amount} CRO** to \`${recipient}\`.\nQuote ID: \`${quote.quoteId}\`\nPlease review and sign below.`
                });
            }

            if (aiResponse) return aiResponse;

            return `I can help you with:\n• "latest block" - Get current block info\n• "balance 0x..." - Check wallet balance\n• "tx 0x..." - View transaction details`;

        } catch (error: any) {
            console.error('Error processing message:', error);
            return `[Error]: ${error.message || 'Failed to process your request'}`;
        }
    }
}
