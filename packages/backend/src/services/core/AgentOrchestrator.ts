import { prisma } from '../../lib/prisma';
import { AgentDecisionEngine } from './AgentDecisionEngine';
import { RiskManager } from './RiskManager';
import { BlockchainService } from '../blockchain.service';
import { AgentConfig, MarketState } from '../../types/agent.types';
import logger from '../../utils/logger';

export class AgentOrchestrator {
    // In-memory map of running loops (simplification for MVP)
    private static runningAgents = new Set<string>();

    static async executeCycle(agentId: string) {
        logger.info(`[Orchestrator] Starting cycle for agent ${agentId}`);

        try {
            // 1. Fetch Agent Data
            const agent = await prisma.agent.findUnique({ where: { id: agentId } });
            if (!agent) throw new Error('Agent not found');
            if (agent.status !== 'active') {
                logger.info(`[Orchestrator] Agent ${agentId} is not active. Skipping.`);
                return;
            }

            // 2. Parse Config
            // Handle potential JSON parsing issues safely
            let config: AgentConfig;
            try {
                config = JSON.parse(agent.config) as AgentConfig;
            } catch (e) {
                // Default fallback if config is invalid or just a string
                config = { risk: 'low', maxTransactionAmount: '100' };
            }

            // 3. Get Market/Wallet State
            // For MVP, we mock prices, but get real balance
            const balance = await BlockchainService.getBalance(agent.walletAddress || '');
            const state: MarketState = {
                walletBalance: balance,
                tokenPrices: {
                    'TCRO': 1.0, // Mock
                    'USDC': 1.0
                }
            };

            // 4. Decision Engine
            const action = await AgentDecisionEngine.evaluateState(state, config);

            if (!action) {
                logger.info(`[Orchestrator] No action decided for agent ${agentId}`);
                return;
            }

            // 5. Risk Check
            const riskCheck = await RiskManager.validateAction(action, config);
            if (!riskCheck.valid) {
                logger.warn(`[Orchestrator] Action blocked by Risk Manager: ${riskCheck.reason}`);
                // Log failed transaction/activity here
                return;
            }

            // 6. Execution (Mock for now, eventually calls BlockchainService to sign/send)
            logger.info(`[Orchestrator] EXECUTING ACTION: ${action.type} ${action.params.amount}`);

            // Record Transaction in DB
            await prisma.transaction.create({
                data: {
                    agentId: agent.id,
                    type: action.type,
                    status: 'completed', // Mock success
                    txHash: '0xmock(' + Date.now() + ')',
                    amount: action.params.amount,
                    token: action.params.tokenIn || 'ETH'
                }
            });

        } catch (error) {
            logger.error(`[Orchestrator] Error in cycle for agent ${agentId}`, error);
        }
    }
}
