import { CryptoComAgent } from '../../../src/services/core/CryptoComAgent';
import { ethers } from 'ethers';

// Mock dependencies
jest.mock('ethers');
jest.mock('@crypto.com/facilitator-client');
jest.mock('@crypto.com/developer-platform-client');

describe('CryptoComAgent', () => {
    let mockSigner: any;
    let mockProvider: any;
    let mockFacilitator: any;

    beforeEach(() => {
        jest.clearAllMocks();

        mockProvider = {
            getBalance: jest.fn(),
        };

        mockSigner = {
            address: '0x1234567890123456789012345678901234567890',
            sendTransaction: jest.fn(),
        };

        mockFacilitator = {
            generatePaymentHeader: jest.fn(),
            generatePaymentRequirements: jest.fn(),
            buildVerifyRequest: jest.fn(),
            settlePayment: jest.fn(),
        };

        (ethers.JsonRpcProvider as jest.Mock).mockReturnValue(mockProvider);
        (ethers.Wallet as any).mockImplementation(() => mockSigner);

        // Mock Facilitator constructor
        const { Facilitator } = require('@crypto.com/facilitator-client');
        Facilitator.mockImplementation(() => mockFacilitator);
    });

    describe('constructor', () => {
        it('should initialize with private key and network', () => {
            const agent = new CryptoComAgent('0xprivatekey');

            expect(agent).toBeDefined();
            expect(ethers.Wallet).toHaveBeenCalled();
        });
    });

    describe('execute', () => {
        it('should handle transfer action', async () => {
            const agent = new CryptoComAgent('0xprivatekey');

            const params = {
                to: '0xrecipient',
                amount: '1.0',
            };

            const mockHeader = 'mock-header';
            const mockRequirements = { payTo: params.to };
            const mockBody = { header: mockHeader };
            const mockResult = { txHash: '0xtxhash' };

            mockFacilitator.generatePaymentHeader.mockResolvedValue(mockHeader);
            mockFacilitator.generatePaymentRequirements.mockReturnValue(mockRequirements);
            mockFacilitator.buildVerifyRequest.mockReturnValue(mockBody);
            mockFacilitator.settlePayment.mockResolvedValue(mockResult);

            const result = await agent.execute('transfer', params);

            expect(result).toEqual({
                status: 'success',
                txHash: '0xtxhash',
                action: 'transfer',
                amount: params.amount,
                recipient: params.to,
            });
            expect(mockFacilitator.generatePaymentHeader).toHaveBeenCalled();
            expect(mockFacilitator.settlePayment).toHaveBeenCalled();
        });

        it('should handle pay action', async () => {
            const agent = new CryptoComAgent('0xprivatekey');

            const params = {
                to: '0xrecipient',
                amount: '2.5',
            };

            mockFacilitator.generatePaymentHeader.mockResolvedValue('header');
            mockFacilitator.generatePaymentRequirements.mockReturnValue({});
            mockFacilitator.buildVerifyRequest.mockReturnValue({});
            mockFacilitator.settlePayment.mockResolvedValue({ txHash: '0xhash' });

            const result = await agent.execute('pay', params);

            expect(result.status).toBe('success');
            expect(result.amount).toBe(params.amount);
        });

        it('should handle get_balance action', async () => {
            const agent = new CryptoComAgent('0xprivatekey');

            const mockBalance = {
                data: {
                    balance: '100.5',
                    token: 'TCRO',
                },
            };

            const { Wallet } = require('@crypto.com/developer-platform-client');
            Wallet.balance = jest.fn().mockResolvedValue(mockBalance);

            const result = await agent.execute('get_balance', {});

            expect(result).toEqual(mockBalance.data);
            expect(Wallet.balance).toHaveBeenCalledWith(mockSigner.address);
        });

        it('should handle get_balance with custom address', async () => {
            const agent = new CryptoComAgent('0xprivatekey');
            const customAddress = '0xcustomaddress';

            const mockBalance = {
                data: {
                    balance: '50.25',
                    token: 'TCRO',
                },
            };

            const { Wallet } = require('@crypto.com/developer-platform-client');
            Wallet.balance = jest.fn().mockResolvedValue(mockBalance);

            const result = await agent.execute('get_balance', { address: customAddress });

            expect(result).toEqual(mockBalance.data);
            expect(Wallet.balance).toHaveBeenCalledWith(customAddress);
        });

        it('should throw error for unsupported action', async () => {
            const agent = new CryptoComAgent('0xprivatekey');

            await expect(agent.execute('unsupported_action', {})).rejects.toThrow(
                "Execution failed: Action 'unsupported_action' not supported by this agent"
            );
        });

        it('should handle payment execution errors', async () => {
            const agent = new CryptoComAgent('0xprivatekey');

            const params = {
                to: '0xrecipient',
                amount: '1.0',
            };

            mockFacilitator.generatePaymentHeader.mockRejectedValue(new Error('Network error'));

            await expect(agent.execute('transfer', params)).rejects.toThrow('Blockchain execution failed');
        });
    });
});
