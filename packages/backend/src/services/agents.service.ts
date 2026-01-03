import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { BlockchainService } from './blockchain.service';

const createAgentSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    type: z.enum(['invest', 'trade', 'research']),
    config: z.string(), // JSON string
});

const updateAgentSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    type: z.enum(['invest', 'trade', 'research']).optional(),
    status: z.enum(['active', 'paused', 'error']).optional(),
    config: z.string().optional(),
});

export class AgentsService {
    static async createAgent(userId: string, data: z.infer<typeof createAgentSchema>) {
        const validated = createAgentSchema.parse(data);

        // Generate EVM Wallet
        const wallet = BlockchainService.createWallet();

        const agent = await prisma.agent.create({
            data: {
                ...validated,
                userId,
                walletAddress: wallet.address,
                walletPrivateKey: wallet.privateKey
            },
        });

        // Remove private key from response
        const { walletPrivateKey, ...safeAgent } = agent;
        return safeAgent;
    }

    static async getAgents(userId: string) {
        const agents = await prisma.agent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });

        return agents;
    }

    static async getAgentById(userId: string, agentId: string) {
        const agent = await prisma.agent.findFirst({
            where: {
                id: agentId,
                userId,
            },
            include: {
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!agent) {
            throw new Error('Agent not found');
        }

        return agent;
    }

    static async updateAgent(userId: string, agentId: string, data: z.infer<typeof updateAgentSchema>) {
        const validated = updateAgentSchema.parse(data);

        // Verify ownership
        const existingAgent = await prisma.agent.findFirst({
            where: { id: agentId, userId },
        });

        if (!existingAgent) {
            throw new Error('Agent not found');
        }

        const updatedAgent = await prisma.agent.update({
            where: { id: agentId },
            data: validated,
        });

        return updatedAgent;
    }

    static async deleteAgent(userId: string, agentId: string) {
        // Verify ownership
        const existingAgent = await prisma.agent.findFirst({
            where: { id: agentId, userId },
        });

        if (!existingAgent) {
            throw new Error('Agent not found');
        }

        await prisma.agent.delete({
            where: { id: agentId },
        });

        return { message: 'Agent deleted successfully' };
    }
}
