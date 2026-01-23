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

            // AI Providers Initialization
            if (OPENAI_KEY) {
                this.openai = new OpenAI({ apiKey: OPENAI_KEY });
                console.log('✅ OpenAI Client initialized (User Provided)');
            }

            if (GEMINI_KEY) {
                this.gemini = new GoogleGenerativeAI(GEMINI_KEY);
                console.log('✅ Google Gemini AI initialized (Fallback/Provided)');
            }

            // Prefer OpenAI if available as it's often more stable for current SDK config
            if (this.openai) {
                this.activeAI = 'openai';
            } else if (this.gemini) {
                this.activeAI = 'gemini';
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

        // Attempt Failover Logic
        const providers: ('openai' | 'gemini')[] = [];
        if (this.openai) providers.push('openai');
        if (this.gemini) providers.push('gemini');

        // Prioritize the currently activeAI
        const sortedProviders = providers.sort((a) => a === this.activeAI ? -1 : 1);

        for (const provider of sortedProviders) {
            try {
                if (provider === 'gemini' && this.gemini) {
                    // Try the latest stable flash model
                    const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
                    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
                    return result.response.text();
                } else if (provider === 'openai' && this.openai) {
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
            } catch (err: any) {
                console.error(`${provider} AI error:`, err.message);
                // On quota error, we continue to next provider if available instead of failing immediately
                if (err.code === 'insufficient_quota' || err.status === 429) {
                    console.warn(`${provider} quota exceeded, checking if failover is possible...`);
                    continue;
                }
                // For other errors, also try next provider
            }
        }

        return `[AI Service Alert] [v4]: Primary AI providers currently hitting rate limits. Using localized blockchain knowledge base.`;
    }

    async processMessage(message: string, _context?: any): Promise<string> {
        if (!this.initialized) {
            return `[Setup Required]: Please configure CDC_DASHBOARD_API_KEY in your Vercel Environment Variables.`;
        }

        try {
            const lowerMessage = message.toLowerCase();
            let aiResponse = '';

            // 1. Immediate Local Checks (Fast Path & Fallback)
            if (lowerMessage.includes('date') || lowerMessage.includes('today')) {
                return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
            }

            if (lowerMessage === 'hi' || lowerMessage === 'hello' || lowerMessage === 'hey') {
                return "Hello! I'm your SyncFlow AI Agent. How can I help you with the Cronos blockchain today?";
            }

            if (lowerMessage.includes('what is blockchain') || lowerMessage.includes('whats blockchain') || lowerMessage.includes('what is block')) {
                return "A blockchain is a decentralized, distributed ledger that records transactions across many computers. On Cronos, this allows for secure, transparent smart contracts! Is there a specific block you're looking for? Try 'latest block'.";
            }

            if (lowerMessage.includes('what is btc') || lowerMessage.includes('whats btc') || lowerMessage.includes('what is bitcoin')) {
                return "Bitcoin (BTC) is the first decentralized cryptocurrency, a digital asset which uses cryptography to secure its transactions. While SyncFlow focus is on Cronos (CRO) and L402 protocols, BTC remains the 'digital gold' of the industry.";
            }

            if (lowerMessage.includes('what is cronos') || lowerMessage.includes('whats cronos')) {
                return "Cronos is the leading Ethereum-compatible layer 1 blockchain network built on the Cosmos SDK, supported by Crypto.com. It's designed to scale the DeFi, GameFi, and NFT ecosystems by providing developers with instant porting of apps and smart contracts.";
            }

            if (lowerMessage.includes('what is sui') || lowerMessage.includes('whats sui') || lowerMessage.includes('sui')) {
                return "Sui is a high-performance Layer 1 blockchain and smart contract platform designed to make digital asset ownership fast, private, secure, and accessible to everyone. It uses the Move programming language for efficient, parallel execution of transactions.";
            }

            if (lowerMessage.includes('what is eth') || lowerMessage.includes('whats ethereum') || lowerMessage.includes('eth')) {
                return "Ethereum (ETH) is a decentralized, open-source blockchain with smart contract functionality. It is the second-largest cryptocurrency by market cap and the foundation for much of DeFi and NFTs. Cronos is fully EVM-compatible with Ethereum!";
            }

            // 2. Fetch Latest Block logic (Localized)
            if (lowerMessage.includes('latest block') || lowerMessage.includes('current block')) {
                // Add 5s timeout to prevent hanging
                const blockPromise = Block.getBlockByTag('latest');
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching block')), 5000));

                try {
                    const response = await Promise.race([blockPromise, timeoutPromise]) as any;
                    return `Latest Block Information:\n${JSON.stringify(response.data, null, 2)}`;
                } catch (e) {
                    return `Failed to fetch block info: ${(e as Error).message}. Check RPC connection.`;
                }
            }

            // 3. Balance & Tx lookups (Localized)
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

            // 4. Transaction Proposals (Localized)
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
                        quoteId: quote.quoteId,
                        agentId: "syncflow-agent"
                    },
                    message: `I've prepared an **X402 Protocol** payment of **${amount} CRO** to \`${recipient}\`.\nQuote ID: \`${quote.quoteId}\`\nPlease review and sign below.`
                });
            }

            // 5. If it's none of the above, try AI
            if (this.activeAI !== 'none') {
                aiResponse = await this.getAIResponse(message);
            }

            if (aiResponse) return aiResponse;

            return `I can help you with:\n• "latest block" - Get current block info\n• "balance 0x..." - Check wallet balance\n• "tx 0x..." - View transaction details\n• "send 0.1 CRO to 0x..." - Propose a payment`;

        } catch (error: any) {
            console.error('Error processing message:', error);
            return `[Error]: ${error.message || 'Failed to process your request'}`;
        }
    }
}
