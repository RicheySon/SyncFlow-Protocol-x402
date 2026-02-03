/**
 * Crypto.com Developer Platform Client
 *
 * This module provides a singleton instance of the Crypto.com Developer Platform SDK
 * configured for Cronos EVM (Chain ID 25).
 *
 * Documentation: https://ai-agent-sdk-docs.crypto.com/crypto.com-developer-platform/on-chain-developer-platform-client-sdk
 */

import { Client, Wallet, Token, Transaction, Block, CronosId } from '@crypto.com/developer-platform-client';

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
 * Singleton flag for initialization
 */
let initialized = false;

/**
 * SDK client interface bundling all SDK modules
 */
interface CryptoComSDK {
    Wallet: typeof Wallet;
    Token: typeof Token;
    Transaction: typeof Transaction;
    Block: typeof Block;
    CronosID: typeof CronosId;
}

/**
 * Initialize the Crypto.com Developer Platform Client
 *
 * @returns {boolean} Whether initialization was successful
 * @throws {Error} If API key is not configured
 */
export function initCryptoComClient(): boolean {
    if (initialized) return true;

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
        // The SDK uses a static Client.init() pattern
        Client.init({
            apiKey,
            provider: CHAIN_ID === 338
                ? 'https://evm-t3.cronos.org'
                : 'https://evm.cronos.org'
        });

        initialized = true;
        console.log('✅ Crypto.com Developer Platform Client configured');

        if (process.env.NODE_ENV === 'development') {
            console.log(`[CryptoCom SDK] Initialized for Chain ID ${CHAIN_ID} (${CHAIN_ID === 25 ? 'Mainnet' : 'Testnet'})`);
        }

        return true;
    } catch (error: any) {
        console.error('[CryptoCom SDK] Failed to initialize client:', error);
        throw new Error(`Failed to initialize Crypto.com Developer Platform Client: ${error.message || 'Unknown error'}`);
    }
}

/**
 * Get the SDK client object for accessing all SDK modules
 * Returns an object bundling Wallet, Token, Transaction, Block, CronosID
 */
export function getCryptoComClient(): CryptoComSDK {
    if (!initialized) {
        initCryptoComClient();
    }
    return {
        Wallet,
        Token,
        Transaction,
        Block,
        CronosID: CronosId
    };
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetCryptoComClient(): void {
    initialized = false;
}

/**
 * Check if client is configured
 */
export function isCryptoComConfigured(): boolean {
    const apiKey = process.env.NEXT_PUBLIC_CRYPTOCOM_API_KEY;
    return !!(apiKey && apiKey !== 'your-api-key-here');
}
