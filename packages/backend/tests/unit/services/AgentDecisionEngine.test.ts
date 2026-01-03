import { AgentDecisionEngine } from '../../../src/services/core/AgentDecisionEngine';
import { MarketState, AgentConfig } from '../../../src/types/agent.types';

describe('AgentDecisionEngine', () => {
    const mockConfig: AgentConfig = {
        risk: 'medium',
        maxTransactionAmount: '1000',
        allowedTokens: ['CRO', 'USDC']
    };

    describe('evaluateState', () => {
        it('should return SWAP action when balance high', async () => {
            const state: MarketState = {
                walletBalance: '15',
                tokenPrices: { CRO: 0.10, USDC: 1.00 }
            };

            const action = await AgentDecisionEngine.evaluateState(state, mockConfig);

            expect(action).not.toBeNull();
            expect(action?.type).toBe('SWAP');
            expect(action?.params.tokenIn).toBe('TCRO');
            expect(action?.params.tokenOut).toBe('USDC');
            expect(action?.params.amount).toBe('1.0');
        });

        it('should return null when balance below threshold', async () => {
            const state: MarketState = {
                walletBalance: '5',
                tokenPrices: { CRO: 0.10, USDC: 1.00 }
            };

            const action = await AgentDecisionEngine.evaluateState(state, mockConfig);

            expect(action).toBeNull();
        });

        it('should handle zero balance', async () => {
            const state: MarketState = {
                walletBalance: '0',
                tokenPrices: { CRO: 0.10 }
            };

            const action = await AgentDecisionEngine.evaluateState(state, mockConfig);

            expect(action).toBeNull();
        });
    });
});
