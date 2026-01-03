export interface AgentAction {
    type: 'SWAP' | 'TRANSFER' | 'STAKE';
    params: {
        tokenIn?: string;
        tokenOut?: string;
        amount: string;
        recipient?: string;
    };
}

export interface AgentConfig {
    risk: 'low' | 'medium' | 'high';
    maxTransactionAmount?: string; // in ETH/CRO
    allowedTokens?: string[];
    tradingStrategy?: 'momentum' | 'mean-reversion';
}

export interface MarketState {
    tokenPrices: Record<string, number>;
    walletBalance: string;
}
