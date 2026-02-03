import { Client, Wallet, Transaction, Block } from '@crypto.com/developer-platform-client';
import { env } from '../config/env.js';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { X402Handler } from './core/x402/X402Handler';
import { CryptoComAgent } from './core/CryptoComAgent';

/**
 * SyncFlow AI Agent Service
 * Uses Crypto.com Developer Platform Client + AI (Gemini/OpenAI/Claude/Ollama) for natural language blockchain queries
 */
export class CdcAgentService {
    private openai: OpenAI | null = null;
    private gemini: GoogleGenerativeAI | null = null;
    private anthropic: Anthropic | null = null;
    private activeAI: 'gemini' | 'openai' | 'claude' | 'ollama' | 'none' = 'none';
    private initialized = false;

    constructor() {
        this.initialize();
    }

    private initialize() {
        try {
            // Initialize Developer Platform Client
            if (env.CDC_DASHBOARD_API_KEY) {
                // FORCE TESTNET PRIORITY: Use CRONOS_RPC_URL first
                const providerUrl = env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org';

                Client.init({
                    apiKey: env.CDC_DASHBOARD_API_KEY,
                    provider: providerUrl
                });
                console.log('✅ Crypto.com Developer Platform Client initialized');
                console.log('🔌 Provider URL (Forced):', providerUrl);
            }

            // Priority order: Gemini (FREE) > Claude (Anthropic) > OpenAI > Ollama (local)
            if (env.GEMINI_API_KEY) {
                this.gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
                this.activeAI = 'gemini';
                console.log('✅ Google Gemini AI initialized (FREE tier)');
            } else if (env.ANTHROPIC_API_KEY) {
                this.anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
                this.activeAI = 'claude';
                console.log('✅ Anthropic Claude AI initialized');
            } else if (env.OPENAI_API_KEY) {
                this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
                this.activeAI = 'openai';
                console.log('✅ OpenAI Client initialized');
            } else if (env.OLLAMA_API_URL) {
                this.activeAI = 'ollama';
                console.log('✅ Ollama Local AI initialized');
                console.log('🔌 Ollama URL:', env.OLLAMA_API_URL);
                console.log('📦 Model:', env.OLLAMA_MODEL);
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

        const systemPrompt = `You are SyncFlow AI, a knowledgeable and helpful AI assistant with both general knowledge and blockchain expertise.

Current Date: ${currentDate}

**Your Capabilities:**
- **General Knowledge**: Answer questions on any topic (history, science, coding, advice, entertainment, etc.)
- **Blockchain Expertise**: Specializing in Cronos network, DeFi, smart contracts, and Web3
- **SyncFlow Platform**: Help users understand autonomous agents, x402 payments, and DeFi automation

**Blockchain Commands (when users ask):**
- Get latest block information
- Check wallet balances (need an address)
- View transaction details (need a tx hash)
- Explain blockchain concepts

**Personality**: Be friendly, conversational, and helpful. Provide clear, concise explanations. If users ask about blockchain data and don't provide required info (like addresses), politely ask for it.

Remember: You can discuss ANY topic, not just blockchain. Be a helpful general-purpose assistant!`;

        try {
            if (this.activeAI === 'gemini' && this.gemini) {
                const model = this.gemini.getGenerativeModel({ model: 'gemini-2.5-flash' });
                const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
                const response = await result.response;
                return response.text();
            } else if (this.activeAI === 'claude' && this.anthropic) {
                const completion = await this.anthropic.messages.create({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 300,
                    system: systemPrompt,
                    messages: [
                        { role: 'user', content: message }
                    ]
                });
                const textContent = completion.content.find(block => block.type === 'text');
                return textContent && textContent.type === 'text' ? textContent.text : '';
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
            } else if (this.activeAI === 'ollama') {
                // Use Ollama local model
                const response = await fetch(`${env.OLLAMA_API_URL}/api/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: env.OLLAMA_MODEL,
                        prompt: `${systemPrompt}\n\nUser: ${message}`,
                        stream: false
                    })
                });

                if (!response.ok) {
                    throw new Error(`Ollama API error: ${response.statusText}`);
                }

                const data = await response.json() as any;
                return data.response || '';
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
    async processMessage(message: string, _context?: any): Promise<string> {
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

            // Check if user wants to SEND tokens (Transaction Proposal)
            // Regex to find amount: "10 cro", "5.5 TCRO", etc.
            const amountMatch = lowerMessage.match(/(\d+(\.\d+)?)\s*(cro|tcro)/i);
            // Regex to find address: 0x...
            const toAddressMatch = message.match(/0x[a-fA-F0-9]{40}/);

            if ((lowerMessage.includes('send') || lowerMessage.includes('transfer') || lowerMessage.includes('execute')) && amountMatch && toAddressMatch) {
                const amount = amountMatch[1];
                const recipient = toAddressMatch[0];

                // Check if user specifically requested AUTONOMOUS execution
                const isAutonomous = lowerMessage.includes('execute') || lowerMessage.includes('agent pay');

                if (isAutonomous && env.PRIVATE_KEY) {
                    try {
                        const agent = new CryptoComAgent(env.PRIVATE_KEY);
                        const result = await agent.execute('transfer', { to: recipient, amount });

                        return `🚀 **Autonomous Execution Successful!**\n\nI have successfully executed the payment using the **Crypto.com Agent SDK** (Facilitator Client).\n\n- **Hash**: \`${result.txHash}\` \n- **Amount**: ${amount} CRO\n- **Recipient**: \`${recipient}\`\n\nTransaction settled on-chain via X402 Protocol.`;
                    } catch (error: any) {
                        return `I tried to execute the transaction autonomously but failed: ${error.message}`;
                    }
                }

                // Default: Return a structured proposal for user to sign in UI (Safe Mode)
                try {
                    const x402Handler = new X402Handler();
                    const quote = await x402Handler.processPayment({
                        token: 'CRO',
                        amount: amount,
                        recipient: recipient
                    });

                    // Return a structured JSON string for the frontend to parse
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
                } catch (error: any) {
                    console.error('X402 processing error:', error);
                    return `I tried to initiate an X402 payment but failed: ${error.message}`;
                }
            }

            // Return AI response if available, otherwise provide helpful fallback
            if (aiResponse) {
                return aiResponse;
            }

            // No AI available - provide direct command help
            const aiStatus = this.activeAI === 'none'
                ? 'No AI provider configured. Add GEMINI_API_KEY (free), ANTHROPIC_API_KEY, or OLLAMA_API_URL to .env for conversational mode.'
                : `${this.activeAI === 'gemini' ? 'Gemini' : this.activeAI === 'claude' ? 'Claude' : this.activeAI === 'ollama' ? 'Ollama' : 'OpenAI'} temporarily unavailable.`;

            return `I can help you with:\n• "latest block" - Get current block info\n• "balance 0x..." - Check wallet balance\n• "tx 0x..." - View transaction details\n\n${aiStatus}`;

        } catch (error: any) {
            console.error('Error processing message:', error);
            return `[Error]: ${error.message || 'Failed to process your request'}`;
        }
    }
}
