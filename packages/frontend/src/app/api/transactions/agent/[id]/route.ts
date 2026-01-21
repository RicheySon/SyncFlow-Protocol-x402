import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // Verify ownership of the agent
        const agent = await prisma.agent.findUnique({ where: { id: params.id } });
        if (!agent) return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
        if (agent.userId !== userId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const transactions = await prisma.transaction.findMany({
            where: { agentId: params.id },
            include: {
                agent: {
                    select: { id: true, name: true, type: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(transactions);
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
