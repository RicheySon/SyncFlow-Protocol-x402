import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: { id: string, recipientId: string } }
) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id: agentId, recipientId } = params;
        const data = await request.json();

        // Verify agent ownership
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId }
        });

        if (!agent) {
            return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
        }

        const updatedRecipient = await prisma.recipient.update({
            where: { id: recipientId, agentId },
            data: {
                name: data.name,
                address: data.address,
                currency: data.currency,
                amount: data.amount?.toString()
            }
        });

        return NextResponse.json(updatedRecipient);
    } catch (error) {
        console.error('Update Recipient Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string, recipientId: string } }
) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { id: agentId, recipientId } = params;

        // Verify agent ownership
        const agent = await prisma.agent.findFirst({
            where: { id: agentId, userId }
        });

        if (!agent) {
            return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
        }

        await prisma.recipient.delete({
            where: { id: recipientId, agentId }
        });

        return NextResponse.json({ message: 'Recipient deleted' });
    } catch (error) {
        console.error('Delete Recipient Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
