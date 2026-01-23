/**
 * Enhanced Wallet Balance Utilities
 * 
 * This module provides utilities for fetching wallet balances with automatic
 * fallback between Crypto.com SDK and direct RPC calls.
 */

import { cryptoComService } from '@/services/cryptocom-blockchain-service';
import { getTCROBalance as getDirectTCROBalance, getERC20Balance as getDirectERC20Balance } from './wallet';

/**
 * Get TCRO balance with smart fallback
 * Tries Crypto.com SDK first, falls back to direct RPC
 */
export async function getOptimizedTCROBalance(address: string): Promise<string> {
    // Try Crypto.com SDK first (faster and more reliable)
    if (cryptoComService.isAvailable()) {
        try {
            const balance = await cryptoComService.getNativeBalance(address);
            console.log('[Balance] Fetched via Crypto.com SDK:', balance);
            return balance;
        } catch (error) {
            console.warn('[Balance] Crypto.com SDK failed, falling back to RPC:', error);
        }
    }

    // Fallback to direct RPC call
    try {
        const balance = await getDirectTCROBalance(address);
        console.log('[Balance] Fetched via direct RPC:', balance);
        return balance;
    } catch (error) {
        console.error('[Balance] All methods failed:', error);
        return '0';
    }
}

/**
 * Get ERC-20 token balance with smart fallback
 */
export async function getOptimizedERC20Balance(
    tokenAddress: string,
    walletAddress: string
): Promise<string> {
    // Try Crypto.com SDK first
    if (cryptoComService.isAvailable()) {
        try {
            const balance = await cryptoComService.getTokenBalance(walletAddress, tokenAddress);
            console.log('[Token Balance] Fetched via Crypto.com SDK:', balance);
            return balance;
        } catch (error) {
            console.warn('[Token Balance] Crypto.com SDK failed, falling back to RPC:', error);
        }
    }

    // Fallback to direct RPC call
    try {
        const balance = await getDirectERC20Balance(tokenAddress, walletAddress);
        console.log('[Token Balance] Fetched via direct RPC:', balance);
        return balance;
    } catch (error) {
        console.error('[Token Balance] All methods failed:', error);
        return '0';
    }
}

/**
 * Get transaction details with Crypto.com SDK
 */
export async function getTransactionDetails(txHash: string): Promise<any> {
    if (!cryptoComService.isAvailable()) {
        throw new Error('Crypto.com SDK not configured');
    }

    try {
        return await cryptoComService.getTransaction(txHash);
    } catch (error) {
        console.error('[Transaction] Failed to fetch details:', error);
        throw error;
    }
}

/**
 * Get transactions for an address
 */
export async function getAddressTransactions(
    address: string,
    page: number = 1,
    limit: number = 10
): Promise<any> {
    if (!cryptoComService.isAvailable()) {
        throw new Error('Crypto.com SDK not configured');
    }

    try {
        return await cryptoComService.getTransactionsByAddress(address, page, limit);
    } catch (error) {
        console.error('[Transactions] Failed to fetch transactions:', error);
        throw error;
    }
}
