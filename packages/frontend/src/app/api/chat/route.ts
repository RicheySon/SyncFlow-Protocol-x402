import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(req: NextRequest) {
    try {
        const { message, context } = await req.json();

        // 1. Auth Check
        const userId = getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // 2. Save User Message
        await prisma.chatMessage.create({
            data: {
                role: 'user',
                content: message,
                userId: userId
            }
        });

        // 3. Call Backend Express Server (with full AI support)
        const backendResponse = await fetch(`${BACKEND_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message, context, userId })
        });

        if (!backendResponse.ok) {
            throw new Error(`Backend returned ${backendResponse.status}`);
        }

        const data = await backendResponse.json();
        const response = data.response || data.message || '';

        // 4. Save Agent Response
        await prisma.chatMessage.create({
            data: {
                role: 'agent',
                content: response,
                userId: userId
            }
        });

        return NextResponse.json({
            response: response,
            timestamp: new Date().toISOString()
        }, { status: 200 });

    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
    }
}
