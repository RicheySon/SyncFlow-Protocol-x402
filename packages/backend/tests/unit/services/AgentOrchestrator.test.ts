import { AgentOrchestrator } from '../../../src/services/core/AgentOrchestrator';
import { prisma } from '../../../src/lib/prisma';
import { BlockchainService } from '../../../src/services/blockchain.service';
import { AgentDecisionEngine } from '../../../src/services/core/AgentDecisionEngine';
import { RiskManager } from '../../../src/services/core/RiskManager';

// Mock dependencies
jest.mock('../../../src/lib/prisma', () => ({
    prisma: {
        agent: {
            findUnique: jest.fn(),
        },
        transaction: {
            create: jest.fn(),
        },
    },
}));

jest.mock('../../../src/services/blockchain.service');
jest.mock('../../../src/services/core/AgentDecisionEngine');
jest.mock('../../../src/services/core/RiskManager');

describe('AgentOrchestrator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('executeCycle', () => {
        it('should skip execution if agent is not found', async () => {
            (prisma.agent.findUnique as jest.Mock).mockResolvedValue(null);

            await AgentOrchestrator.executeCycle('invalid-id');

            expect(prisma.agent.findUnique).toHaveBeenCalledWith({ where: { id: 'invalid-id' } });
            expect(BlockchainService.getBalance).not.toHaveBeenCalled();
        });

        it('should skip execution if agent is not active', async () => {
            const mockAgent = {
                id: 'test-agent',
                status: 'paused',
                config: JSON.stringify({ risk: 'low' }),
                walletAddress: '0x123',
            };

            (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);

            await AgentOrchestrator.executeCycle('test-agent');

            expect(BlockchainService.getBalance).not.toHaveBeenCalled();
        });

        it('should execute full cycle for active agent', async () => {
            const mockAgent = {
                id: 'test-agent',
                status: 'active',
                config: JSON.stringify({ risk: 'low', maxTransactionAmount: '100' }),
                walletAddress: '0x123',
            };

            const mockAction = {
                type: 'SWAP',
                params: {
                    tokenIn: 'TCRO',
                    tokenOut: 'USDC',
                    amount: '1.0',
                },
            };

            (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);
            (BlockchainService.getBalance as jest.Mock).mockResolvedValue('50.0');
            (AgentDecisionEngine.evaluateState as jest.Mock).mockResolvedValue(mockAction);
            (RiskManager.validateAction as jest.Mock).mockResolvedValue({ valid: true });
            (prisma.transaction.create as jest.Mock).mockResolvedValue({});

            await AgentOrchestrator.executeCycle('test-agent');

            expect(prisma.agent.findUnique).toHaveBeenCalledWith({ where: { id: 'test-agent' } });
            expect(BlockchainService.getBalance).toHaveBeenCalledWith('0x123');
            expect(AgentDecisionEngine.evaluateState).toHaveBeenCalled();
            expect(RiskManager.validateAction).toHaveBeenCalledWith(mockAction, { risk: 'low', maxTransactionAmount: '100' });
            expect(prisma.transaction.create).toHaveBeenCalled();
        });

        it('should block action if risk validation fails', async () => {
            const mockAgent = {
                id: 'test-agent',
                status: 'active',
                config: JSON.stringify({ risk: 'low' }),
                walletAddress: '0x123',
            };

            const mockAction = {
                type: 'SWAP',
                params: {
                    tokenIn: 'TCRO',
                    tokenOut: 'USDC',
                    amount: '1000.0',
                },
            };

            (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);
            (BlockchainService.getBalance as jest.Mock).mockResolvedValue('50.0');
            (AgentDecisionEngine.evaluateState as jest.Mock).mockResolvedValue(mockAction);
            (RiskManager.validateAction as jest.Mock).mockResolvedValue({
                valid: false,
                reason: 'Amount exceeds limit',
            });

            await AgentOrchestrator.executeCycle('test-agent');

            expect(prisma.transaction.create).not.toHaveBeenCalled();
        });

        it('should handle invalid config gracefully', async () => {
            const mockAgent = {
                id: 'test-agent',
                status: 'active',
                config: 'invalid-json',
                walletAddress: '0x123',
            };

            (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);
            (BlockchainService.getBalance as jest.Mock).mockResolvedValue('50.0');
            (AgentDecisionEngine.evaluateState as jest.Mock).mockResolvedValue(null);

            await AgentOrchestrator.executeCycle('test-agent');

            expect(AgentDecisionEngine.evaluateState).toHaveBeenCalled();
        });

        it('should skip execution if decision engine returns null', async () => {
            const mockAgent = {
                id: 'test-agent',
                status: 'active',
                config: JSON.stringify({ risk: 'low' }),
                walletAddress: '0x123',
            };

            (prisma.agent.findUnique as jest.Mock).mockResolvedValue(mockAgent);
            (BlockchainService.getBalance as jest.Mock).mockResolvedValue('5.0');
            (AgentDecisionEngine.evaluateState as jest.Mock).mockResolvedValue(null);

            await AgentOrchestrator.executeCycle('test-agent');

            expect(RiskManager.validateAction).not.toHaveBeenCalled();
            expect(prisma.transaction.create).not.toHaveBeenCalled();
        });
    });
});
