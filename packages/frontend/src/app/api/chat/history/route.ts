import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const userId = getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const messages = await prisma.chatMessage.findMany({
            where: { userId },
            orderBy: { createdAt: 'asc' },
            take: 100 // Limit to last 100 messages for safety
        });

        // Map database fields to frontend expectations
        const formattedMessages = messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: msg.createdAt.toISOString()
        }));

        return NextResponse.json({ messages: formattedMessages });

    } catch (error) {
        console.error('Chat History API error:', error);
        return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = getUserIdFromRequest(req);

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.chatMessage.deleteMany({
            where: { userId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Chat Clear API error:', error);
        return NextResponse.json({ error: 'Failed to clear chat history' }, { status: 500 });
    }
}
