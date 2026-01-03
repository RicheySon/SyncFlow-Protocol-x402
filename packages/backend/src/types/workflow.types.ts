export interface WorkflowStep {
    id: string;
    type: 'ACTION' | 'CONDITION' | 'DELAY';
    targetAgentId?: string; // If action is performed by an agent
    actionType?: 'SWAP' | 'TRANSFER';
    params: any;
}

export interface WorkflowConfig {
    steps: WorkflowStep[];
}
