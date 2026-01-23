import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        chainId: process.env.CRONOS_CHAIN_ID || "338",
        rpcUrl: process.env.CRONOS_RPC_URL || "https://evm-t3.cronos.org",
        env: process.env.NODE_ENV || "development"
    });
}
