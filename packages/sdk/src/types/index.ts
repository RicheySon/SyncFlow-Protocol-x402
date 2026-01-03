export interface SyncFlowConfig {
    apiKey: string;
    baseUrl?: string;
}

export interface Agent {
    id: string;
    name: string;
    type: string;
    status: string;
    walletAddress?: string;
}

export interface Workflow {
    id: string;
    name: string;
    status: string;
    steps: any[];
}
