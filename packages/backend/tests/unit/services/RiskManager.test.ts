import { RiskManager } from '../../../src/services/core/RiskManager';
import { AgentAction, AgentConfig } from '../../../src/types/agent.types';

describe('RiskManager', () => {
    const mockConfig: AgentConfig = {
        risk: 'medium',
        maxTransactionAmount: '1000',
        allowedTokens: ['CRO', 'USDC']
    };

    describe('validateAction', () => {
        it('should approve valid action within limits', async () => {
            const action: AgentAction = {
                type: 'SWAP',
                params: {
                    tokenIn: 'CRO',
                    tokenOut: 'USDC',
                    amount: '500'
                }
            };

            const result = await RiskManager.validateAction(action, mockConfig);

            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
        });

        it('should reject action exceeding max amount', async () => {
            const action: AgentAction = {
                type: 'SWAP',
                params: {
                    tokenIn: 'CRO',
                    tokenOut: 'USDC',
                    amount: '2000'
                }
            };

            const result = await RiskManager.validateAction(action, mockConfig);

            expect(result.valid).toBe(false);
            expect(result.reason).toContain('exceeds');
        });

        it('should reject action with disallowed token', async () => {
            const action: AgentAction = {
                type: 'SWAP',
                params: {
                    tokenIn: 'BTC',
                    tokenOut: 'USDC',
                    amount: '100'
                }
            };

            const result = await RiskManager.validateAction(action, mockConfig);

            expect(result.valid).toBe(false);
            expect(result.reason).toContain('not allowed');
        });

        it('should approve action at exact max amount', async () => {
            const action: AgentAction = {
                type: 'SWAP',
                params: {
                    tokenIn: 'CRO',
                    tokenOut: 'USDC',
                    amount: '1000'
                }
            };

            const result = await RiskManager.validateAction(action, mockConfig);

            expect(result.valid).toBe(true);
        });
    });
});
