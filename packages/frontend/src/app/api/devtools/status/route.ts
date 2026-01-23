import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { ethers } from 'ethers';

export async function GET() {
    try {
        // 1. Check Database
        let databaseStatus = 'disconnected';
        try {
            await prisma.$queryRaw`SELECT 1`;
            databaseStatus = 'connected';
        } catch (dbError) {
            console.error('Status Check: Database Error', dbError);
        }

        // 2. Check Blockchain (Cronos RPC)
        let blockchainStatus = 'pending';
        try {
            const rpcUrl = process.env.CRONOS_RPC_URL || "https://evm-t3.cronos.org";
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const blockNumber = await provider.getBlockNumber();
            blockchainStatus = `connected (Block: ${blockNumber})`;
        } catch (rpcError: any) {
            console.error('Status Check: RPC Error', rpcError.message);
            blockchainStatus = 'error';
        }

        return NextResponse.json({
            status: databaseStatus === 'connected' ? 'operational' : 'degraded',
            services: {
                database: databaseStatus,
                api: 'running',
                blockchain_rpc: blockchainStatus
            },
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            services: {
                database: 'error',
                api: 'running',
                blockchain_rpc: 'error'
            }
        }, { status: 500 });
    }
}
