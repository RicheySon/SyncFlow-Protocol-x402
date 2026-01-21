import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MOCK_TRANSACTIONS = [
    {
        id: 'tx-1',
        txHash: '0x3a2b1c...',
        network: 'Cronos',
        type: 'SWAP',
        status: 'COMPLETED',
        amount: '100.00',
        token: 'USDC',
        agentId: 'agent-1',
        agent: { id: 'agent-1', name: 'Alpha Bot', type: 'trade' },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'tx-2',
        txHash: '0x9z8y7x...',
        network: 'Cronos',
        type: 'VOTE',
        status: 'PENDING',
        amount: '0',
        token: 'x402',
        agentId: 'agent-2',
        agent: { id: 'agent-2', name: 'DAO Bot', type: 'dao' },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

export async function GET(request: Request) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return NextResponse.json(MOCK_TRANSACTIONS);
}
