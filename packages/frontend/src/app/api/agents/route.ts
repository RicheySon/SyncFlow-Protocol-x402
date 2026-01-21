import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const userId = getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const agents = await prisma.agent.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                transactions: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }
            }
        });

        return NextResponse.json(agents);
    } catch (error) {
        console.error('Get Agents Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const data = await request.json();

        // Validate
        if (!data.name || !data.type) {
            return NextResponse.json({ message: 'Name and Type are required' }, { status: 400 });
        }

        const newAgent = await prisma.agent.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                status: 'active',
                config: data.config || '{}',
                userId: userId,
                // Mock wallet for now if not provided, or logic to generate one
                walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
            },
        });

        return NextResponse.json(newAgent);
    } catch (err) {
        console.error('Create Agent Error:', err);
        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
}
