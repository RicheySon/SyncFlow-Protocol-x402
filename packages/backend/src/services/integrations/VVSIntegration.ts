import { ethers } from 'ethers';
import { BlockchainService } from '../blockchain.service';
import logger from '../../utils/logger';

const VVS_ROUTER_ADDRESS = '0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae'; // Cronos VVS Router
const ROUTER_ABI = [
    'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
    'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
];

export class VVSIntegration {
    static async getSwapQuote(tokenIn: string, tokenOut: string, amount: string) {
        logger.info(`[VVS] Getting REAL swap quote: ${amount} ${tokenIn} -> ${tokenOut}`);

        try {
            const provider = BlockchainService.getProvider();
            const router = new ethers.Contract(VVS_ROUTER_ADDRESS, ROUTER_ABI, provider);

            // In a real app, we need to resolve token symbols to addresses
            // For hackathon MVP, we'll hardcode a few testnet addresses or throw if unknown
            const tokenMap: Record<string, string> = {
                'WCRO': '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23', // Wrapper CRO (Testnet)
                'USDC': '0xc21223249CA28397B4B6541dfFaEcC539BfF0c59', // Mock USDC (Testnet)
                'TCRO': '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'  // alias
            };

            const addressIn = tokenMap[tokenIn] || tokenIn;
            const addressOut = tokenMap[tokenOut] || tokenOut;

            if (!ethers.isAddress(addressIn) || !ethers.isAddress(addressOut)) {
                throw new Error(`Invalid token addresses: ${tokenIn}, ${tokenOut}`);
            }

            const amountInWei = ethers.parseEther(amount); // Assuming 18 decimals for simplicity
            const path = [addressIn, addressOut];

            // Call Smart Contract
            const amounts = await router.getAmountsOut(amountInWei, path);
            const amountOut = ethers.formatEther(amounts[1]);

            logger.info(`[VVS] Quote received: ${amountOut} ${tokenOut}`);

            return {
                router: VVS_ROUTER_ADDRESS,
                path,
                amountOutMin: amountOut
            };
        } catch (error) {
            logger.error('[VVS] Error getting quote from blockchain', error);
            throw error;
        }
    }
}
