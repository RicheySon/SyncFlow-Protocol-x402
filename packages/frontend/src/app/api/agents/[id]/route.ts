import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const id = params.id;

    const mockAgent = {
        id: id,
        name: 'Mock Agent ' + id,
        description: 'Details for agent ' + id,
        type: 'invest',
        status: 'active',
        config: '{}',
        userId: 'user-1',
        walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockAgent);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const data = await request.json();
    return NextResponse.json({ ...data, id: params.id, updatedAt: new Date().toISOString() });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    return NextResponse.json({ message: 'Agent deleted' });
}
