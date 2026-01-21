import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const agent = await prisma.agent.findUnique({
            where: { id: params.id },
            include: {
                transactions: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                }
            }
        });

        if (!agent) {
            return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
        }

        if (agent.userId !== userId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(agent);
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // Check ownership
        const agent = await prisma.agent.findUnique({ where: { id: params.id } });
        if (!agent) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        if (agent.userId !== userId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        const updatedAgent = await prisma.agent.update({
            where: { id: params.id },
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                status: data.status,
                config: data.config,
            },
        });

        return NextResponse.json(updatedAgent);
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = getUserIdFromRequest(request);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const agent = await prisma.agent.findUnique({ where: { id: params.id } });
        if (!agent) return NextResponse.json({ message: 'Not found' }, { status: 404 });
        if (agent.userId !== userId) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

        await prisma.agent.delete({ where: { id: params.id } });

        return NextResponse.json({ message: 'Agent deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
