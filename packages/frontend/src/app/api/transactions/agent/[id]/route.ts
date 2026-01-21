import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    // Return transactions specific to an agent (Mocked as same list for now)
    const MOCK_TRANSACTIONS = [
        {
            id: 'tx-1',
            txHash: '0x3a2b1c...',
            network: 'Cronos',
            type: 'SWAP',
            status: 'COMPLETED',
            amount: '50.00',
            token: 'USDC',
            agentId: params.id,
            agent: { id: params.id, name: 'Agent ' + params.id, type: 'trade' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ];

    await new Promise(resolve => setTimeout(resolve, 400));
    return NextResponse.json(MOCK_TRANSACTIONS);
}
