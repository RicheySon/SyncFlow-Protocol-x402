import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

export const dynamic = 'force-dynamic';

// Mock Protected Data
const AGENT_SECRETS = {
    'top-secret-strategy': "BUY LOW, SELL HIGH (Confirmed by AI)",
    'alpha-leak': "TCRO to the moon! 🚀"
};

export async function POST(request: Request) {
    try {
        const headers = request.headers;
        const paymentProof = headers.get('x-payment-proof'); // TxHash
        const paymentId = headers.get('x-payment-id');

        // Check if Paid
        if (paymentProof) {
            console.log(`Protected Resource Requested with Proof: ${paymentProof}`);

            // In a real app, verify the proof against the DB or Chain again
            // For now, if we have a TxHash, we assume the Client SDK did its job (intercepted 402, paid, sent hash)

            return NextResponse.json({
                status: 'success',
                data: 'Authorized Access: Protocol Metrics [CONFIDENTIAL]',
                secret: AGENT_SECRETS['top-secret-strategy']
            });
        }

        // Not Paid -> Return 402 Challenge
        console.log('Access Denied. Issuing L402 Challenge...');

        // Define Payment Options
        const paymentOptions = [{
            network: 'cronos',
            chainId: 338,
            payTo: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', // Demo Wallet Address
            maxAmountRequired: '0.01', // 0.01 TCRO
            asset: 'TCRO',
            extra: {
                paymentId: 'pay_' + Math.random().toString(36).substr(2, 9)
            }
        }];

        return NextResponse.json({
            accepts: paymentOptions
        }, { status: 402 });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Error' }, { status: 500 });
    }
}
