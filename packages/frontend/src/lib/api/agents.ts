import { apiClient } from '../api';

export interface Agent {
    id: string;
    name: string;
    description?: string;
    type: 'invest' | 'trade' | 'research' | 'protocol' | 'dao' | 'fund' | 'individual' | string;
    status: 'active' | 'paused' | 'error';
    config: string;
    userId: string;
    walletAddress?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAgentData {
    name: string;
    description?: string;
    type: 'invest' | 'trade' | 'research' | 'protocol' | 'dao' | 'fund' | 'individual' | string;
    config: string;
}

export interface UpdateAgentData {
    name?: string;
    description?: string;
    type?: 'invest' | 'trade' | 'research' | 'protocol' | 'dao' | 'fund' | 'individual' | string;
    status?: 'active' | 'paused' | 'error';
    config?: string;
}

export const agentsApi = {
    getAll: async (): Promise<Agent[]> => {
        return apiClient<Agent[]>('/agents');
    },

    getById: async (id: string): Promise<Agent> => {
        return apiClient<Agent>(`/agents/${id}`);
    },

    create: async (data: CreateAgentData): Promise<Agent> => {
        return apiClient<Agent>('/agents', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: UpdateAgentData): Promise<Agent> => {
        return apiClient<Agent>(`/agents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/agents/${id}`, {
            method: 'DELETE',
        });
    },
};
