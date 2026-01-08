import { SyncFlowClient } from './client/SyncFlowClient';
import { AgentClient } from './client/AgentClient';
import { SyncFlowConfig } from './types';

export class SyncFlow extends SyncFlowClient {
    public agents: AgentClient;

    constructor(config: SyncFlowConfig) {
        super(config);
        this.agents = new AgentClient(config);
    }
}

export * from './types';
