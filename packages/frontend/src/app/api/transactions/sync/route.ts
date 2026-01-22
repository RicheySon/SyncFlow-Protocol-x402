import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth-utils';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

const RPC_URL = process.env.CRONOS_RPC_URL || 'https://evm-t3.cronos.org';

export async function GET(req: NextRequest) {
    try {
        const userId = getUserIdFromRequest(req);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        // 1. Get all agents for this user
        const agents = await prisma.agent.findMany({
            where: { userId },
            select: { id: true }
        });
        const agentIds = agents.map(a => a.id);

        // 2. Find pending transactions
        const pendingTxs = await prisma.transaction.findMany({
            where: {
                agentId: { in: agentIds },
                status: 'pending'
            }
        });

        if (pendingTxs.length === 0) {
            return NextResponse.json({ message: 'No pending transactions to sync', synced: 0 });
        }

        // 3. Connect to Provider
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        let syncedCount = 0;

        // 4. Check each transaction
        for (const tx of pendingTxs) {
            try {
                const receipt = await provider.getTransactionReceipt(tx.txHash);

                if (receipt) {
                    const newStatus = receipt.status === 1 ? 'success' : 'failed';
                    await prisma.transaction.update({
                        where: { id: tx.id },
                        data: { status: newStatus }
                    });
                    syncedCount++;
                }
            } catch (err) {
                console.error(`Error syncing tx ${tx.txHash}:`, err);
            }
        }

        return NextResponse.json({
            message: `Synced ${syncedCount} transactions`,
            synced: syncedCount
        });

    } catch (error) {
        console.error('Transaction Sync Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
