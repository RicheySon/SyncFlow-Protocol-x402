export const CRONOS_CONFIG = {
    chainId: 338,
    chainName: 'Cronos Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_CRONOS_RPC_URL || 'https://evm-t3.cronos.org',
    explorerUrl: process.env.NEXT_PUBLIC_CRONOS_EXPLORER || 'https://cronos.org/explorer/testnet3',
    nativeCurrency: {
        name: 'Cronos',
        symbol: 'CRO',
        decimals: 18,
    },
};

export const CONTRACTS = {
    agentWallet: process.env.NEXT_PUBLIC_CONTRACT_AGENT_WALLET || '0xBfcCb5a28Aa4B2e8975CaFBE53A521afFEC42255',
    paymentRouter: process.env.NEXT_PUBLIC_CONTRACT_PAYMENT_ROUTER || '',
    conditionalExecutor: process.env.NEXT_PUBLIC_CONTRACT_CONDITIONAL_EXECUTOR || '',
    devUSDC: '0xc01efAaF7C5C61bEbFAeb358E1161b537b8bC0e0',
};

export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: 30000,
};

export const AGENT_TYPES = {
    DAO_MANAGER: 'DAO Manager',
    TRADING_BOT: 'Trading Bot',
    HEDGE_MANAGER: 'Hedge Manager',
} as const;

export const TRANSACTION_TYPES = {
    X402_PAYMENT: 'x402 Payment',
    SWAP: 'Swap',
    DEPOSIT: 'Deposit',
    WITHDRAWAL: 'Withdrawal',
    BATCH_TRANSFER: 'Batch Transfer',
} as const;

export const WORKFLOW_STATUS = {
    ACTIVE: 'active',
    DRAFT: 'draft',
    FAILED: 'failed',
} as const;

export const AGENT_STATUS = {
    ACTIVE: 'active',
    PAUSED: 'paused',
    ERROR: 'error',
} as const;
