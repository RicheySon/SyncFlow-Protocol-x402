import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const agentId = params.id;

        // Verify agent ownership
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId }
        });

        if (!agent) {
            return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
        }

        const recipients = await prisma.recipient.findMany({
            where: { agentId },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json(recipients);
    } catch (error) {
        console.error('Get Recipients Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const agentId = params.id;
        const data = await request.json();

        // Verify agent ownership
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId }
        });

        if (!agent) {
            return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
        }

        if (!data.name || !data.address) {
            return NextResponse.json({ message: 'Name and Address are required' }, { status: 400 });
        }

        const newRecipient = await prisma.recipient.create({
            data: {
                name: data.name,
                address: data.address,
                currency: data.currency || 'TCRO',
                amount: data.amount?.toString(),
                agentId: agentId
            }
        });

        return NextResponse.json(newRecipient);
    } catch (error) {
        console.error('Create Recipient Error:', error);
        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
}
