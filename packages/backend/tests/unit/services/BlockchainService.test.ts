import { BlockchainService } from '../../../src/services/blockchain.service';

describe('BlockchainService', () => {
    beforeEach(() => {
        // Reset provider between tests
        (BlockchainService as any).provider = null;
    });

    describe('getProvider', () => {
        it('should return a provider instance', () => {
            const provider = BlockchainService.getProvider();
            expect(provider).toBeDefined();
        });

        it('should reuse the same provider instance', () => {
            const provider1 = BlockchainService.getProvider();
            const provider2 = BlockchainService.getProvider();
            expect(provider1).toBe(provider2);
        });
    });

    describe('createWallet', () => {
        it('should create a new wallet with address and private key', () => {
            const wallet = BlockchainService.createWallet();

            expect(wallet).toHaveProperty('address');
            expect(wallet).toHaveProperty('privateKey');
            expect(wallet.address).toMatch(/^0x[a-fA-F0-9]{40}$/);
            expect(wallet.privateKey).toMatch(/^0x[a-fA-F0-9]{64}$/);
        });

        it('should create unique wallets on each call', () => {
            const wallet1 = BlockchainService.createWallet();
            const wallet2 = BlockchainService.createWallet();

            expect(wallet1.address).not.toBe(wallet2.address);
            expect(wallet1.privateKey).not.toBe(wallet2.privateKey);
        });
    });

    describe('getBalance', () => {
        it('should fetch balance for a given address', async () => {
            // Use a valid Cronos testnet address for testing
            const balance = await BlockchainService.getBalance('0x0000000000000000000000000000000000000000');

            expect(typeof balance).toBe('string');
            expect(parseFloat(balance)).toBeGreaterThanOrEqual(0);
        }, 30000); // Increase timeout for network call
    });

    describe('getBlockNumber', () => {
        it('should fetch current block number', async () => {
            const blockNumber = await BlockchainService.getBlockNumber();

            expect(typeof blockNumber).toBe('number');
            expect(blockNumber).toBeGreaterThan(0);
        }, 30000); // Increase timeout for network call
    });
});
