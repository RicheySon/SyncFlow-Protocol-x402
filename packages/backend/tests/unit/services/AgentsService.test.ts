import { AgentsService } from '../../../src/services/agents.service';
import { prisma } from '../../../src/lib/prisma';
import { BlockchainService } from '../../../src/services/blockchain.service';

jest.mock('../../../src/lib/prisma', () => ({
    prisma: {
        agent: {
            create: jest.fn(),
            findMany: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock('../../../src/services/blockchain.service');

describe('AgentsService', () => {
    const mockUserId = 'user-123';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createAgent', () => {
        it('should create a new agent with wallet', async () => {
            const mockWallet = {
                address: '0x1234567890123456789012345678901234567890',
                privateKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            };

            const mockAgentData = {
                name: 'Test Agent',
                description: 'A test trading agent',
                type: 'trade' as const,
                config: JSON.stringify({ risk: 'low' }),
            };

            const mockCreatedAgent = {
                id: 'agent-123',
                ...mockAgentData,
                userId: mockUserId,
                walletAddress: mockWallet.address,
                walletPrivateKey: mockWallet.privateKey,
                status: 'active',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (BlockchainService.createWallet as jest.Mock).mockReturnValue(mockWallet);
            (prisma.agent.create as jest.Mock).mockResolvedValue(mockCreatedAgent);

            const result = await AgentsService.createAgent(mockUserId, mockAgentData);

            expect(BlockchainService.createWallet).toHaveBeenCalled();
            expect(prisma.agent.create).toHaveBeenCalledWith({
                data: {
                    ...mockAgentData,
                    userId: mockUserId,
                    walletAddress: mockWallet.address,
                    walletPrivateKey: mockWallet.privateKey,
                },
            });
            expect(result).not.toHaveProperty('walletPrivateKey');
            expect(result.walletAddress).toBe(mockWallet.address);
        });

        it('should throw error for invalid agent data', async () => {
            const invalidData = {
                name: '',
                type: 'invalid' as any,
                config: '{}',
            };

            await expect(AgentsService.createAgent(mockUserId, invalidData)).rejects.toThrow();
        });
    });

    describe('getAgents', () => {
        it('should return all agents for a user', async () => {
            const mockAgents = [
                {
                    id: 'agent-1',
                    name: 'Agent 1',
                    type: 'trade',
                    status: 'active',
                    userId: mockUserId,
                },
                {
                    id: 'agent-2',
                    name: 'Agent 2',
                    type: 'invest',
                    status: 'paused',
                    userId: mockUserId,
                },
            ];

            (prisma.agent.findMany as jest.Mock).mockResolvedValue(mockAgents);

            const result = await AgentsService.getAgents(mockUserId);

            expect(prisma.agent.findMany).toHaveBeenCalledWith({
                where: { userId: mockUserId },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(mockAgents);
        });

        it('should return empty array if no agents exist', async () => {
            (prisma.agent.findMany as jest.Mock).mockResolvedValue([]);

            const result = await AgentsService.getAgents(mockUserId);

            expect(result).toEqual([]);
        });
    });

    describe('getAgentById', () => {
        it('should return agent with transactions', async () => {
            const mockAgent = {
                id: 'agent-123',
                name: 'Test Agent',
                userId: mockUserId,
                transactions: [
                    { id: 'tx-1', type: 'SWAP', status: 'completed' },
                    { id: 'tx-2', type: 'TRANSFER', status: 'pending' },
                ],
            };

            (prisma.agent.findFirst as jest.Mock).mockResolvedValue(mockAgent);

            const result = await AgentsService.getAgentById(mockUserId, 'agent-123');

            expect(prisma.agent.findFirst).toHaveBeenCalledWith({
                where: {
                    id: 'agent-123',
                    userId: mockUserId,
                },
                include: {
                    transactions: {
                        orderBy: { createdAt: 'desc' },
                        take: 10,
                    },
                },
            });
            expect(result).toEqual(mockAgent);
        });

        it('should throw error if agent not found', async () => {
            (prisma.agent.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(AgentsService.getAgentById(mockUserId, 'invalid-id')).rejects.toThrow('Agent not found');
        });
    });

    describe('updateAgent', () => {
        it('should update agent successfully', async () => {
            const existingAgent = {
                id: 'agent-123',
                name: 'Old Name',
                userId: mockUserId,
            };

            const updateData = {
                name: 'New Name',
                status: 'paused' as const,
            };

            const updatedAgent = {
                ...existingAgent,
                ...updateData,
            };

            (prisma.agent.findFirst as jest.Mock).mockResolvedValue(existingAgent);
            (prisma.agent.update as jest.Mock).mockResolvedValue(updatedAgent);

            const result = await AgentsService.updateAgent(mockUserId, 'agent-123', updateData);

            expect(prisma.agent.findFirst).toHaveBeenCalledWith({
                where: { id: 'agent-123', userId: mockUserId },
            });
            expect(prisma.agent.update).toHaveBeenCalledWith({
                where: { id: 'agent-123' },
                data: updateData,
            });
            expect(result.name).toBe('New Name');
        });

        it('should throw error if agent not found', async () => {
            (prisma.agent.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(
                AgentsService.updateAgent(mockUserId, 'invalid-id', { name: 'Test' })
            ).rejects.toThrow('Agent not found');
        });
    });

    describe('deleteAgent', () => {
        it('should delete agent successfully', async () => {
            const existingAgent = {
                id: 'agent-123',
                userId: mockUserId,
            };

            (prisma.agent.findFirst as jest.Mock).mockResolvedValue(existingAgent);
            (prisma.agent.delete as jest.Mock).mockResolvedValue(existingAgent);

            const result = await AgentsService.deleteAgent(mockUserId, 'agent-123');

            expect(prisma.agent.findFirst).toHaveBeenCalledWith({
                where: { id: 'agent-123', userId: mockUserId },
            });
            expect(prisma.agent.delete).toHaveBeenCalledWith({
                where: { id: 'agent-123' },
            });
            expect(result.message).toBe('Agent deleted successfully');
        });

        it('should throw error if agent not found', async () => {
            (prisma.agent.findFirst as jest.Mock).mockResolvedValue(null);

            await expect(AgentsService.deleteAgent(mockUserId, 'invalid-id')).rejects.toThrow('Agent not found');
        });
    });
});
