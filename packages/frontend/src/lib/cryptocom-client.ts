/**
 * Crypto.com Developer Platform Client
 * 
 * This module provides a singleton instance of the Crypto.com Developer Platform SDK
 * configured for Cronos EVM (Chain ID 25).
 * 
 * Documentation: https://ai-agent-sdk-docs.crypto.com/crypto.com-developer-platform/on-chain-developer-platform-client-sdk
 */

import { CryptoComClient } from '@crypto.com/developer-platform-client';

/**
 * Chain configuration for Cronos EVM Mainnet
 */
const CRONOS_EVM_CHAIN_ID = 25;
const CRONOS_EVM_TESTNET_CHAIN_ID = 338;

/**
 * Determine which chain to use based on environment
 */
const CHAIN_ID = process.env.NEXT_PUBLIC_CRONOS_CHAIN_ID === '338'
    ? CRONOS_EVM_TESTNET_CHAIN_ID
    : CRONOS_EVM_CHAIN_ID;

/**
 * Singleton instance of Crypto.com Developer Platform Client
 */
let client: CryptoComClient | null = null;

/**
 * Initialize the Crypto.com Developer Platform Client
 * 
 * @returns {CryptoComClient} Configured client instance
 * @throws {Error} If API key is not configured
 */
export function getCryptoComClient(): CryptoComClient {
    if (!client) {
        const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOM_API_KEY;

        if (!apiKey || apiKey === 'your-api-key-here') {
            if (process.env.NODE_ENV === 'development') {
                console.warn(
                    '[CryptoCom SDK] API key not configured. Please set NEXT_PUBLIC_CRYPTOCOM_API_KEY in .env file.\n' +
                    'Get your API key from: https://developer-platform.crypto.com/'
                );
            }
            throw new Error('Crypto.com API key not configured');
        }

        try {
            client = new CryptoComClient({
                apiKey,
                chainId: CHAIN_ID,
            });

            if (process.env.NODE_ENV === 'development') {
                console.log(`[CryptoCom SDK] Initialized for Chain ID ${CHAIN_ID} (${CHAIN_ID === 25 ? 'Mainnet' : 'Testnet'})`);
            }
        } catch (error: any) {
            console.error('[CryptoCom SDK] Failed to initialize client:', error);
            throw new Error(`Failed to initialize Crypto.com Developer Platform Client: ${error.message || 'Unknown error'}`);
        }
    }

    return client;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetCryptoComClient(): void {
    client = null;
}

/**
 * Check if client is configured
 */
export function isCryptoComConfigured(): boolean {
    const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOM_API_KEY;
    return !!(apiKey && apiKey !== 'your-api-key-here');
}
