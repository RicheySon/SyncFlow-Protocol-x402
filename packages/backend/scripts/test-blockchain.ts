import { BlockchainService } from '../src/services/blockchain.service';
import { env } from '../src/config/env';

async function main() {
    console.log('🔗 Testing Blockchain Connectivity...');
    console.log(`RPC URL: ${env.CRONOS_RPC_URL}`);

    try {
        const provider = BlockchainService.getProvider();
        const network = await provider.getNetwork();
        console.log(`✅ Connected to Chain ID: ${network.chainId}`);

        const blockNumber = await BlockchainService.getBlockNumber();
        console.log(`📦 Current Block: ${blockNumber}`);

        console.log('\n👛 Testing Wallet Generation...');
        const wallet = BlockchainService.createWallet();
        console.log(`✅ Generated Wallet: ${wallet.address}`);
        console.log(`🔑 Private Key: ${wallet.privateKey.substring(0, 10)}...`);

        const balance = await BlockchainService.getBalance(wallet.address);
        console.log(`💰 Balance: ${balance} TCRO`);

    } catch (error) {
        console.error('❌ Blockchain Test Failed:', error);
        process.exit(1);
    }
}

main();
