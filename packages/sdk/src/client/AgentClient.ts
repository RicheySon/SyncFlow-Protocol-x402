import { SyncFlowClient } from './SyncFlowClient';
import { Agent } from '../types';

export class AgentClient extends SyncFlowClient {
    async create(data: Partial<Agent>): Promise<Agent> {
        const res = await this.api.post('/agents', data);
        return res.data;
    }

    async get(id: string): Promise<Agent> {
        const res = await this.api.get(`/agents/${id}`);
        return res.data;
    }

    async list(): Promise<Agent[]> {
        const res = await this.api.get('/agents');
        return res.data;
    }
}
