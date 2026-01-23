/**
 * Crypto.com Blockchain Service
 * 
 * Provides blockchain utility functions using the Crypto.com Developer Platform SDK.
 * This service wraps SDK methods for wallet, token, and transaction operations.
 * 
 * Documentation: https://ai-agent-sdk-docs.crypto.com/crypto.com-developer-platform/on-chain-developer-platform-client-sdk
 */

import { getCryptoComClient, isCryptoComConfigured } from '@/lib/cryptocom-client';

export class CryptoComBlockchainService {
    /**
     * Get native token balance for an address
     */
    async getNativeBalance(address: string): Promise<string> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const balance = await client.Token.getNativeTokenBalance(address);
            return balance;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to fetch native balance:', error);
            throw error;
        }
    }

    /**
     * Get ERC-20 token balance for an address
     */
    async getTokenBalance(
        address: string,
        tokenAddress: string
    ): Promise<string> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const balance = await client.Token.getERC20Balance(address, tokenAddress);
            return balance;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to fetch token balance:', error);
            throw error;
        }
    }

    /**
     * Get transaction details by hash
     */
    async getTransaction(txHash: string): Promise<any> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const transaction = await client.Transaction.getTransactionByHash(txHash);
            return transaction;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to fetch transaction:', error);
            throw error;
        }
    }

    /**
     * Get transaction status by hash
     */
    async getTransactionStatus(txHash: string): Promise<any> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const status = await client.Transaction.getTransactionStatus(txHash);
            return status;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to fetch transaction status:', error);
            throw error;
        }
    }

    /**
     * Get transactions by wallet address
     */
    async getTransactionsByAddress(
        address: string,
        page: number = 1,
        limit: number = 10
    ): Promise<any> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const transactions = await client.Transaction.getTransactionsByAddress(
                address,
                { page, limit }
            );
            return transactions;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to fetch transactions:', error);
            throw error;
        }
    }

    /**
     * Create a new wallet
     */
    async createWallet(): Promise<any> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const wallet = await client.Wallet.createWallet();
            return wallet;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to create wallet:', error);
            throw error;
        }
    }

    /**
     * Resolve CronosID to address
     */
    async resolveCronosID(cronosId: string): Promise<string> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const address = await client.CronosID.resolve(cronosId);
            return address;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to resolve CronosID:', error);
            throw error;
        }
    }

    /**
     * Reverse lookup address to CronosID
     */
    async reverseLookupCronosID(address: string): Promise<string> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const cronosId = await client.CronosID.reverseLookup(address);
            return cronosId;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to reverse lookup:', error);
            throw error;
        }
    }

    /**
     * Get current gas price
     */
    async getGasPrice(): Promise<string> {
        if (!isCryptoComConfigured()) {
            throw new Error('Crypto.com SDK not configured');
        }

        try {
            const client = getCryptoComClient();
            const gasPrice = await client.Transaction.getGasPrice();
            return gasPrice;
        } catch (error) {
            console.error('[CryptoCom Service] Failed to fetch gas price:', error);
            throw error;
        }
    }

    /**
     * Check if service is available
     */
    isAvailable(): boolean {
        return isCryptoComConfigured();
    }
}

// Export singleton instance
export const cryptoComService = new CryptoComBlockchainService();
