import { ethers, BrowserProvider, parseEther, formatEther } from 'ethers';
import { CRONOS_CONFIG, CONTRACTS } from './config';

// Define window.ethereum type
declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface WalletState {
    isConnected: boolean;
    address: string | null;
    chainId: number | null;
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet(): Promise<WalletState> {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
        const provider = new BrowserProvider(window.ethereum);

        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        // Check if on correct network
        if (Number(network.chainId) !== CRONOS_CONFIG.chainId) {
            await switchToCronosTestnet();
        }

        return {
            isConnected: true,
            address,
            chainId: Number(network.chainId),
        };
    } catch (error: any) {
        console.error('Wallet connection error:', error);
        throw new Error(error.message || 'Failed to connect wallet');
    }
}

/**
 * Switch network to Cronos Testnet
 */
export async function switchToCronosTestnet(): Promise<void> {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }

    try {
        // Try to switch to Cronos Testnet
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${CRONOS_CONFIG.chainId.toString(16)}` }],
        });
    } catch (switchError: any) {
        // Network not added, add it
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: `0x${CRONOS_CONFIG.chainId.toString(16)}`,
                        chainName: CRONOS_CONFIG.chainName,
                        nativeCurrency: CRONOS_CONFIG.nativeCurrency,
                        rpcUrls: [CRONOS_CONFIG.rpcUrl],
                        blockExplorerUrls: [CRONOS_CONFIG.explorerUrl],
                    },
                ],
            });
        } else {
            throw switchError;
        }
    }
}

/**
 * Get TCRO balance for address
 */
export async function getTCROBalance(address: string): Promise<string> {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }

    try {
        const provider = new BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        return formatEther(balance);
    } catch (error) {
        console.error('Error fetching TCRO balance:', error);
        throw error;
    }
}

/**
 * Send TCRO deposit to agent contract
 */
export async function sendTCRODeposit(
    toAddress: string,
    amount: string
): Promise<{ hash: string; wait: () => Promise<any> }> {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }

    try {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Validate amount
        const amountWei = parseEther(amount);
        if (amountWei <= 0n) {
            throw new Error('Amount must be greater than 0');
        }

        // Send transaction
        const tx = await signer.sendTransaction({
            to: toAddress,
            value: amountWei,
        });

        return {
            hash: tx.hash,
            wait: () => tx.wait(),
        };
    } catch (error: any) {
        console.error('Deposit transaction error:', error);
        throw new Error(error.message || 'Failed to send deposit');
    }
}

/**
 * Get current connected wallet state
 */
export async function getWalletState(): Promise<WalletState> {
    if (!window.ethereum) {
        return { isConnected: false, address: null, chainId: null };
    }

    try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length === 0) {
            return { isConnected: false, address: null, chainId: null };
        }

        const network = await provider.getNetwork();

        return {
            isConnected: true,
            address: accounts[0].address,
            chainId: Number(network.chainId),
        };
    } catch (error) {
        console.error('Error getting wallet state:', error);
        return { isConnected: false, address: null, chainId: null };
    }
}

/**
 * Format transaction hash for explorer link
 */
export function getExplorerTxLink(txHash: string): string {
    return `${CRONOS_CONFIG.explorerUrl}/tx/${txHash}`;
}
