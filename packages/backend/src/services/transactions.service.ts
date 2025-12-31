import { prisma } from '../lib/prisma';

export class TransactionsService {
    static async getTransactions(userId: string, filters?: { status?: string; type?: string }) {
        // Get all agents for this user first
        const userAgents = await prisma.agent.findMany({
            where: { userId },
            select: { id: true },
        });

        const agentIds = userAgents.map((agent) => agent.id);

        const transactions = await prisma.transaction.findMany({
            where: {
                agentId: { in: agentIds },
                ...(filters?.status && { status: filters.status }),
                ...(filters?.type && { type: filters.type }),
            },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100, // Limit to last 100 transactions
        });

        return transactions;
    }

    static async getTransactionById(userId: string, txId: string) {
        const transaction = await prisma.transaction.findFirst({
            where: { id: txId },
            include: {
                agent: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        userId: true,
                    },
                },
            },
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        // Verify that the transaction belongs to one of the user's agents
        if (transaction.agent?.userId !== userId) {
            throw new Error('Unauthorized');
        }

        return transaction;
    }

    static async getTransactionsByAgent(userId: string, agentId: string) {
        // Verify agent ownership
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId },
        });

        if (!agent) {
            throw new Error('Agent not found');
        }

        const transactions = await prisma.transaction.findMany({
            where: { agentId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return transactions;
    }
}
