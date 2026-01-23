import { Client, Wallet, Transaction, Block } from '@crypto.com/developer-platform-client';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { X402Handler } from './core/x402/X402Handler';
import { prisma } from '../prisma';
import { ethers } from 'ethers';

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

    private async getAIResponse(message: string, userId?: string): Promise<string> {
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const systemPrompt = `You are a professional SyncFlow AI Assistant on the Cronos Network.
Current Date: ${currentDate}

Your purpose is to help users interact with the blockchain using natural language.
You have access to specific tools to fetch data and propose transactions.

Tone: Professional, helpful, and concise.
When a user expresses intent (e.g., "send money", "check my wallet"), use the appropriate tool.
If a tool execution requires parameters the user hasn't provided, ask for them politely.

SyncFlow Protocol details:
- SyncFlow uses the X402 protocol for secure payments.
- When proposing a transaction, you generate a special JSON structure (via tools) that the UI understands.
- You can help manage "Agents" and their "Recipients" for batch distributions.`;

        // Attempt Failover Logic
        const providers: ('openai' | 'gemini')[] = [];
        if (this.openai) providers.push('openai');
        if (this.gemini) providers.push('gemini');

        if (!this.openai && !this.gemini) {
            return `[AI Service Alert]: No AI API keys found. Please set GEMINI_API_KEY or OPENAI_API_KEY.`;
        }

        const sortedProviders = providers.sort((a) => a === this.activeAI ? -1 : 1);
        const errors: string[] = [];

        for (const provider of sortedProviders) {
            try {
                if (provider === 'openai' && this.openai) {
                    const tools: any[] = [
                        {
                            type: "function",
                            function: {
                                name: "get_latest_block",
                                description: "Retrieve information about the latest block or a specific block height on Cronos.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        tag: { type: "string", description: "Block tag (e.g. 'latest') or height", default: "latest" }
                                    }
                                }
                            }
                        },
                        {
                            type: "function",
                            function: {
                                name: "get_balance",
                                description: "Check the CRO balance of a specific Cronos wallet address.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        address: { type: "string", description: "The 0x... wallet address to check" }
                                    },
                                    required: ["address"]
                                }
                            }
                        },
                        {
                            type: "function",
                            function: {
                                name: "get_transaction",
                                description: "Get details and status for a specific transaction hash.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        txHash: { type: "string", description: "The 0x... transaction hash" }
                                    },
                                    required: ["txHash"]
                                }
                            }
                        },
                        {
                            type: "function",
                            function: {
                                name: "propose_payment",
                                description: "Prepare a transaction proposal for the user to sign. Use this when the user wants to send/transfer funds.",
                                parameters: {
                                    type: "object",
                                    properties: {
                                        to: { type: "string", description: "Recipient 0x... address" },
                                        amount: { type: "string", description: "Amount of CRO to send" },
                                        token: { type: "string", description: "Token symbol (e.g. CRO)", default: "CRO" }
                                    },
                                    required: ["to", "amount"]
                                }
                            }
                        },
                        {
                            type: "function",
                            function: {
                                name: "batch_distribute",
                                description: "Trigger a batch payout to all recipients configured for the user's active agent.",
                                parameters: {
                                    type: "object",
                                    properties: {}
                                }
                            }
                        }
                    ];

                    const response = await this.openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: message }
                        ],
                        tools,
                        tool_choice: "auto"
                    });

                    const responseMessage = response.choices[0].message;

                    if (responseMessage.tool_calls) {
                        for (const toolCall of responseMessage.tool_calls) {
                            const functionName = toolCall.function.name;
                            const args = JSON.parse(toolCall.function.arguments);

                            if (functionName === "get_latest_block") {
                                const res = await Block.getBlockByTag(args.tag || 'latest');
                                return `Latest Block Information:\n${JSON.stringify((res as any).data, null, 2)}`;
                            }

                            if (functionName === "get_balance") {
                                const res = await Wallet.balance(args.address);
                                return `Balance for ${args.address}:\n${JSON.stringify((res as any).data, null, 2)}`;
                            }

                            if (functionName === "get_transaction") {
                                const res = await Transaction.getTransactionByHash(args.txHash);
                                return `Transaction Details:\n${JSON.stringify((res as any).data, null, 2)}`;
                            }

                            if (functionName === "propose_payment") {
                                const x402Handler = new X402Handler();
                                const quote = await x402Handler.processPayment({
                                    token: args.token || 'CRO',
                                    amount: args.amount,
                                    recipient: args.to
                                });

                                return JSON.stringify({
                                    type: "transaction_proposal",
                                    data: {
                                        to: args.to,
                                        amount: args.amount,
                                        token: args.token || "CRO",
                                        protocol: "x402",
                                        quoteId: quote.quoteId,
                                        agentId: "syncflow-agent"
                                    },
                                    message: `I've prepared an **X402 Protocol** payment of **${args.amount} CRO** to \`${args.to}\`.\nPlease review and sign below.`
                                });
                            }

                            if (functionName === "batch_distribute") {
                                if (!userId) return "I need your user ID to look up your agent's recipients.";

                                const agent = await (prisma.agent as any).findFirst({
                                    where: { userId, status: 'Active' },
                                    include: { recipients: true }
                                });

                                if (!agent) return "You don't have an active agent configured for batch distribution.";
                                if (agent.recipients.length === 0) return `Agent **${agent.name}** has no recipients.`;

                                const totalAmount = (agent.recipients as any[]).reduce((sum: number, r: any) => sum + Number(r.amount), 0);

                                return JSON.stringify({
                                    type: "transaction_proposal",
                                    isBatch: true,
                                    data: {
                                        agentId: agent.id,
                                        agentName: agent.name,
                                        recipients: (agent.recipients as any[]).map((r: any) => ({
                                            name: r.name,
                                            address: r.address,
                                            amount: r.amount,
                                            currency: r.currency
                                        })),
                                        totalAmount,
                                        token: "CRO",
                                        protocol: "x402"
                                    },
                                    message: `I've prepared a **Batch Distribution** for **${agent.name}** (${agent.recipients.length} recipients, total ${totalAmount} CRO).`
                                });
                            }
                        }
                    }

                    return responseMessage.content || "I'm not sure how to respond to that.";

                } else if (provider === 'gemini' && this.gemini) {
                    // Gemini fallback (standard text for now, or could use Gemini function calling)
                    const model = this.gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
                    const result = await model.generateContent(`${systemPrompt}\n\nUser: ${message}`);
                    return result.response.text();
                }
            } catch (err: any) {
                console.error(`${provider} AI error:`, err.message);
                errors.push(`${provider.toUpperCase()}: ${err.message}`);
                continue;
            }
        }

        return `[AI Service Alert]: Providers failed. Errors: ${errors.join(', ')}`;
    }

    async processMessage(message: string, context?: any, userId?: string): Promise<string> {
        if (!this.initialized) {
            return `[Setup Required]: Please configure CDC_DASHBOARD_API_KEY.`;
        }

        try {
            const lowerMessage = message.toLowerCase();

            // 1. Core Logic (Localized)
            if (lowerMessage === 'hi' || lowerMessage === 'hello') {
                return "Hello! I'm your SyncFlow AI Agent. How can I help you with Cronos today?";
            }

            if (lowerMessage.includes('debug status')) {
                const providers = [];
                if (this.openai) providers.push('OpenAI');
                if (this.gemini) providers.push('Gemini');
                return `**System Status Check [v10]**:\n- CDC Platform: Ready\n- AI Tools: Active (OpenAI Tool Calling enabled)\n- Node: Cronos Testnet`;
            }

            // 2. Delegate to AI with Tool Calling
            if (this.activeAI !== 'none') {
                return await this.getAIResponse(message, userId);
            }
            return `I can help you with:\n• "latest block" - Get current block info\n• "balance 0x..." - Check wallet balance\n• "send 0.1 CRO to 0x..." - Propose a payment`;
        } catch (error: any) {
            console.error('Error processing message:', error);
            return `[Error]: ${error.message || 'Failed to process request'}`;
        }
    }
}
