import logger from '../../../utils/logger';
import { BlockchainService } from '../../blockchain.service';

export class SettlementMonitor {
    static async verifySettlement(txHash: string): Promise<boolean> {
        logger.info(`[SettlementMonitor] Verifying settlement for ${txHash}`);

        try {
            const provider = BlockchainService.getProvider();
            const tx = await provider.getTransaction(txHash);

            if (tx && tx.blockNumber) {
                // Determine status based on confirmations or logs
                // For MVP, if it's mined (has blockNumber), it's "Settled"
                logger.info(`[SettlementMonitor] Transaction confirmed in block ${tx.blockNumber}`);
                return true;
            }

            logger.info(`[SettlementMonitor] Transaction pending or not found`);
            return false;
        } catch (e) {
            logger.error(`[SettlementMonitor] Error checking tx`, e);
            return false;
        }
    }
}
