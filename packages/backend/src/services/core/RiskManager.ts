import { AgentAction, AgentConfig } from '../../types/agent.types';
import { ethers } from 'ethers';

export class RiskManager {
    static async validateAction(action: AgentAction, config: AgentConfig): Promise<{ valid: boolean; reason?: string }> {
        // 1. Check Max Transaction Amount
        if (config.maxTransactionAmount) {
            const amount = parseFloat(action.params.amount);
            const maxAmount = parseFloat(config.maxTransactionAmount);

            if (amount > maxAmount) {
                return { valid: false, reason: `Amount ${amount} exceeds limit ${maxAmount}` };
            }
        }

        // 2. Check Allowed Tokens (for SWAP)
        if (action.type === 'SWAP' && config.allowedTokens) {
            if (action.params.tokenIn && !config.allowedTokens.includes(action.params.tokenIn)) {
                return { valid: false, reason: `Token ${action.params.tokenIn} not allowed` };
            }
            if (action.params.tokenOut && !config.allowedTokens.includes(action.params.tokenOut)) {
                return { valid: false, reason: `Token ${action.params.tokenOut} not allowed` };
            }
        }

        // 3. Risk Profile Checks (Simplistic for MVP)
        if (config.risk === 'low' && action.type === 'SWAP') {
            // Low risk might only allow stablecoins (mock check)
            // In a real app, we'd check if tokenOut is stable
        }

        return { valid: true };
    }
}
