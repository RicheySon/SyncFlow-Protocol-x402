import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MOCK_AGENTS = [
    {
        id: 'agent-1',
        name: 'Alpha Trading Bot',
        description: 'High-frequency arbitrage bot on Cronos',
        type: 'trade',
        status: 'active',
        config: '{}',
        userId: 'user-1',
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'agent-2',
        name: 'DAO Governance Assistant',
        description: 'Automated proposal analysis and voting',
        type: 'dao',
        status: 'paused',
        config: '{}',
        userId: 'user-1',
        walletAddress: '0x21E205e2C45417E81d39F28183cA0BA1493ACeee',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export async function GET() {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(MOCK_AGENTS);
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Validate
        if (!data.name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const newAgent = {
            id: 'agent-' + Math.random().toString(36).substr(2, 9),
            ...data,
            status: 'active',
            userId: 'user-1',
            walletAddress: '0x' + Math.random().toString(16).substr(2, 40),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Note: This won't persist in serverless, but returns success for UI feedback
        return NextResponse.json(newAgent);
    } catch (err) {
        return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }
}
