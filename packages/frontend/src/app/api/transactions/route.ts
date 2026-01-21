import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Fetch transactions for ALL agents owned by user
        // First get agent IDs
        const userAgents = await prisma.agent.findMany({
            where: { userId },
            select: { id: true }
        });

        const agentIds = userAgents.map(a => a.id);

        const transactions = await prisma.transaction.findMany({
            where: {
                agentId: {
                    in: agentIds
                }
            },
            include: {
                agent: {
                    select: { id: true, name: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Transactions Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
