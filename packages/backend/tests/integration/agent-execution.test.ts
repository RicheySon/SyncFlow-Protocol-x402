import { AgentOrchestrator } from '../../src/services/core/AgentOrchestrator';
import { AgentsService } from '../../src/services/agents.service';
import { BlockchainService } from '../../src/services/blockchain.service';
import { prisma } from '../../src/lib/prisma';

/**
 * Integration tests for full agent execution flow
 * These tests verify the complete lifecycle of an agent from creation to execution
 */
describe('Agent Execution Integration Tests', () => {
    let testUserId: string;
    let testAgentId: string;

    beforeAll(async () => {
        // Create a test user
        const testUser = await prisma.user.create({
            data: {
                email: `test-${Date.now()}@example.com`,
                password: 'hashed-password',
                name: 'Test User',
            },
        });
        testUserId = testUser.id;
    });

    afterAll(async () => {
        // Clean up test data
        if (testAgentId) {
            await prisma.transaction.deleteMany({ where: { agentId: testAgentId } });
            await prisma.agent.deleteMany({ where: { userId: testUserId } });
        }
        await prisma.user.deleteMany({ where: { id: testUserId } });
        await prisma.$disconnect();
    });

    describe('Full Agent Lifecycle', () => {
        it('should create agent with wallet', async () => {
            const agentData = {
                name: 'Integration Test Agent',
                description: 'Test agent for integration testing',
                type: 'trade' as const,
                config: JSON.stringify({
                    risk: 'low',
                    maxTransactionAmount: '100',
                }),
            };

            const agent = await AgentsService.createAgent(testUserId, agentData);

            expect(agent).toBeDefined();
            expect(agent.id).toBeDefined();
            expect(agent.walletAddress).toBeDefined();
            expect(agent.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
            expect(agent).not.toHaveProperty('walletPrivateKey');

            testAgentId = agent.id;
        });

        it('should retrieve agent with details', async () => {
            const agent = await AgentsService.getAgentById(testUserId, testAgentId);

            expect(agent).toBeDefined();
            expect(agent.id).toBe(testAgentId);
            expect(agent.name).toBe('Integration Test Agent');
            expect(agent.transactions).toBeDefined();
            expect(Array.isArray(agent.transactions)).toBe(true);
        });

        it('should get wallet balance from blockchain', async () => {
            const agent = await prisma.agent.findUnique({
                where: { id: testAgentId },
            });

            expect(agent).toBeDefined();

            const balance = await BlockchainService.getBalance(agent!.walletAddress!);

            expect(balance).toBeDefined();
            expect(typeof balance).toBe('string');
            // New wallet should have 0 balance
            expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
        });

        it('should execute agent cycle', async () => {
            // Note: This will use mock data for prices and may not execute actual transactions
            await expect(AgentOrchestrator.executeCycle(testAgentId)).resolves.not.toThrow();
        });

        it('should update agent status', async () => {
            const updatedAgent = await AgentsService.updateAgent(testUserId, testAgentId, {
                status: 'paused',
            });

            expect(updatedAgent.status).toBe('paused');
        });

        it('should not execute paused agent', async () => {
            const transactionsBefore = await prisma.transaction.count({
                where: { agentId: testAgentId },
            });

            await AgentOrchestrator.executeCycle(testAgentId);

            const transactionsAfter = await prisma.transaction.count({
                where: { agentId: testAgentId },
            });

            // Should not create new transactions when paused
            expect(transactionsAfter).toBe(transactionsBefore);
        });

        it('should list all user agents', async () => {
            const agents = await AgentsService.getAgents(testUserId);

            expect(Array.isArray(agents)).toBe(true);
            expect(agents.length).toBeGreaterThan(0);
            expect(agents.some(a => a.id === testAgentId)).toBe(true);
        });

        it('should delete agent', async () => {
            const result = await AgentsService.deleteAgent(testUserId, testAgentId);

            expect(result.message).toBe('Agent deleted successfully');

            await expect(AgentsService.getAgentById(testUserId, testAgentId)).rejects.toThrow('Agent not found');
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid agent ID gracefully', async () => {
            await expect(AgentOrchestrator.executeCycle('invalid-id')).resolves.not.toThrow();
        });

        it('should prevent unauthorized access to agent', async () => {
            const unauthorizedUserId = 'unauthorized-user-id';

            await expect(AgentsService.getAgentById(unauthorizedUserId, testAgentId)).rejects.toThrow('Agent not found');
        });

        it('should validate agent creation data', async () => {
            const invalidData = {
                name: '', // Empty name should fail
                type: 'invalid' as any,
                config: '{}',
            };

            await expect(AgentsService.createAgent(testUserId, invalidData)).rejects.toThrow();
        });
    });

    describe('Blockchain Integration', () => {
        it('should create unique wallets for each agent', async () => {
            const agent1 = await AgentsService.createAgent(testUserId, {
                name: 'Agent 1',
                type: 'trade',
                config: '{}',
            });

            const agent2 = await AgentsService.createAgent(testUserId, {
                name: 'Agent 2',
                type: 'invest',
                config: '{}',
            });

            expect(agent1.walletAddress).not.toBe(agent2.walletAddress);

            // Cleanup
            await AgentsService.deleteAgent(testUserId, agent1.id);
            await AgentsService.deleteAgent(testUserId, agent2.id);
        });

        it('should get current block number', async () => {
            const blockNumber = await BlockchainService.getBlockNumber();

            expect(typeof blockNumber).toBe('number');
            expect(blockNumber).toBeGreaterThan(0);
        });
    });
});
