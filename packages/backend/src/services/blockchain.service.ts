import { ethers } from 'ethers';
import { env } from '../config/env';

export class BlockchainService {
    private static provider: ethers.JsonRpcProvider;

    public static getProvider(): ethers.JsonRpcProvider {
        if (!this.provider) {
            this.provider = new ethers.JsonRpcProvider(env.CRONOS_RPC_URL);
        }
        return this.provider;
    }

    public static createWallet(): { address: string; privateKey: string } {
        const wallet = ethers.Wallet.createRandom();
        return {
            address: wallet.address,
            privateKey: wallet.privateKey,
        };
    }

    public static async getBalance(address: string): Promise<string> {
        const provider = this.getProvider();
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
    }

    public static async getBlockNumber(): Promise<number> {
        const provider = this.getProvider();
        return await provider.getBlockNumber();
    }
}
