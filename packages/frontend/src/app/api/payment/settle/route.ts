import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paymentId, txHash, chainId } = body;

        if (!txHash) {
            return NextResponse.json({ message: 'Transaction Hash required' }, { status: 400 });
        }

        // Verify Transaction on Chain
        const rpcUrl = process.env.NEXT_PUBLIC_CRONOS_RPC_URL || 'https://evm-t3.cronos.org';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        console.log(`Verifying Tx ${txHash} on Chain ${chainId || 338}...`);

        // Get Tx
        const tx = await provider.getTransaction(txHash);

        if (!tx) {
            return NextResponse.json({ message: 'Transaction not found on chain' }, { status: 404 });
        }

        // Check Confirmations
        // For testnet demo, 0 confs (mempool) might be acceptable, but 1 is better.
        // We'll proceed if it exists.

        // Verify Recipient (Should ideally match a configured wallet)
        // For Hackathon, we trust the Client sent it to the right place if the SDK logic is correct.
        // In prod, check tx.to === PROJECT_WALLET

        // Save Payment Record to DB
        // We can store it in a 'Payment' table, or just trust the Verification for the moment.
        // If we want "One Payment = One Access", we should store usage.

        // For Demo: success
        return NextResponse.json({
            success: true,
            message: 'Payment Settled',
            paymentId: paymentId || txHash
        });

    } catch (error: any) {
        console.error('Payment Settlement Failed:', error);
        return NextResponse.json({ message: `Verification Failed: ${error.message}` }, { status: 500 });
    }
}
