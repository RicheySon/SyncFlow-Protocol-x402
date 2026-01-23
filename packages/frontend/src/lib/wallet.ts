import { ethers, BrowserProvider, JsonRpcProvider, parseEther, formatEther } from 'ethers';
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
 * Helper to find MetaMask provider using EIP-6963 or Legacy checks
 */
async function getMetaMaskProvider(): Promise<any> {
    // 1. Try EIP-6963 (Standard)
    if (typeof window !== 'undefined') {
        const foundProvider = await new Promise<any>((resolve) => {
            const handleAnnounce = (event: any) => {
                const { info, provider } = event.detail;
                if (info.rdns === 'io.metamask') {
                    window.removeEventListener("eip6963:announceProvider", handleAnnounce);
                    resolve(provider);
                }
            };

            window.addEventListener("eip6963:announceProvider", handleAnnounce);
            window.dispatchEvent(new Event("eip6963:requestProvider"));

            // Short timeout to wait for announcement
            setTimeout(() => {
                window.removeEventListener("eip6963:announceProvider", handleAnnounce);
                resolve(null);
            }, 500); // 500ms usually enough for local injection
        });

        if (foundProvider) return foundProvider;
    }

    // 2. Try Legacy window.ethereum.providers (e.g. Coinbase + MetaMask co-existing)
    if (window.ethereum && (window.ethereum as any).providers) {
        const provider = (window.ethereum as any).providers.find((p: any) => p.isMetaMask);
        if (provider) return provider;
    }

    // 3. Try Legacy window.ethereum DIRECTLY (Standard single wallet)
    if (window.ethereum && window.ethereum.isMetaMask) {
        return window.ethereum;
    }

    // 4. Fallback (DANGEROUS: might return Hot Wallet or others)
    // We only return this if we are desperate, but user specifically said "doesn't call meta mask".
    // If we are here, we probably didn't find "isMetaMask" flag.
    return window.ethereum;
}

/**
 * Get a provider for reading data (RPC fallback)
 */
export async function getProvider(): Promise<JsonRpcProvider | BrowserProvider> {
    if (typeof window !== 'undefined' && window.ethereum) {
        try {
            const browserProvider = new BrowserProvider(window.ethereum);
            const network = await browserProvider.getNetwork();
            if (Number(network.chainId) === CRONOS_CONFIG.chainId) {
                return browserProvider;
            }
        } catch (e) {
            console.warn('Browser provider not ready for reading, falling back to RPC');
        }
    }
    return new JsonRpcProvider(CRONOS_CONFIG.rpcUrl);
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet(): Promise<WalletState> {
    const providerInstance = await getMetaMaskProvider();

    if (!providerInstance) {
        throw new Error('MetaMask not installed. Please install MetaMask to continue.');
    }

    try {
        const provider = new BrowserProvider(providerInstance);

        // Request account access
        await providerInstance.request({ method: 'eth_requestAccounts' });

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
    try {
        const provider = await getProvider();
        const balance = await provider.getBalance(address);
        return formatEther(balance);
    } catch (error) {
        console.error('Error fetching TCRO balance:', error);
        // Secondary fallback to pure RPC if above failed
        try {
            const rpcProvider = new JsonRpcProvider(CRONOS_CONFIG.rpcUrl);
            const balance = await rpcProvider.getBalance(address);
            return formatEther(balance);
        } catch (e2) {
            return '0';
        }
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
        if (amountWei <= BigInt(0)) {
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

const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

/**
 * Send ERC20 Token
 */
export async function sendERC20Token(
    tokenAddress: string,
    toAddress: string,
    amount: string
): Promise<{ hash: string; wait: () => Promise<any> }> {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // Contract instance
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    // Get decimals
    const decimals = await contract.decimals();
    const amountUnits = ethers.parseUnits(amount, decimals);

    const tx = await contract.transfer(toAddress, amountUnits);

    return {
        hash: tx.hash,
        wait: () => tx.wait()
    };
}

/**
 * Get ERC20 Balance
 */
export async function getERC20Balance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
        const provider = await getProvider();
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

        const balance = await contract.balanceOf(walletAddress);
        const decimals = await contract.decimals();

        return ethers.formatUnits(balance, decimals);
    } catch (e) {
        console.warn('Error fetching ERC20 balance via provider, trying pure RPC fallback');
        try {
            const rpcProvider = new JsonRpcProvider(CRONOS_CONFIG.rpcUrl);
            const contract = new ethers.Contract(tokenAddress, ERC20_ABI, rpcProvider);
            const balance = await contract.balanceOf(walletAddress);
            const decimals = await contract.decimals();
            return ethers.formatUnits(balance, decimals);
        } catch (e2) {
            console.error('ERC20 balance fetch failed', e2);
            return '0';
        }
    }
}

/**
 * Deploy a new SyncFlowAgent contract
 */
export async function deploySyncFlowAgent(
    name: string,
    type: string
): Promise<{ address: string; hash: string; wait: () => Promise<any> }> {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }

    try {
        const { BrowserProvider, ContractFactory } = await import('ethers');
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Dynamically import ABI/Bytecode to avoid large bundle size if not used
        const artifact = await import('../../abis/SyncFlowAgent.json');
        const abi = artifact.abi;
        const bytecode = artifact.bytecode;

        const factory = new ContractFactory(abi, bytecode, signer);

        console.log('Deploying SyncFlowAgent...', { name, type });
        const contract = await factory.deploy(name, type);

        console.log('Deployment transaction sent:', contract.deploymentTransaction()?.hash);

        await contract.waitForDeployment();
        const address = await contract.getAddress();
        console.log('SyncFlowAgent deployed at:', address);

        return {
            address,
            hash: contract.deploymentTransaction()?.hash || '',
            wait: () => contract.waitForDeployment()
        };
    } catch (error: any) {
        console.error('Agent deployment error:', error);
        throw new Error(error.message || 'Failed to deploy agent contract');
    }
}
