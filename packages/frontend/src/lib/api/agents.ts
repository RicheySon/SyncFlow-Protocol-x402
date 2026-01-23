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
    walletPrivateKey?: string;
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

export interface Recipient {
    id: string;
    name: string;
    address: string;
    currency: string;
    amount?: string;
    agentId: string;
    createdAt: string;
    updatedAt: string;
}

export const recipientsApi = {
    getAll: async (agentId: string): Promise<Recipient[]> => {
        return apiClient<Recipient[]>(`/agents/${agentId}/recipients`);
    },

    create: async (agentId: string, data: Partial<Recipient>): Promise<Recipient> => {
        return apiClient<Recipient>(`/agents/${agentId}/recipients`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (agentId: string, recipientId: string, data: Partial<Recipient>): Promise<Recipient> => {
        return apiClient<Recipient>(`/agents/${agentId}/recipients/${recipientId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (agentId: string, recipientId: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/agents/${agentId}/recipients/${recipientId}`, {
            method: 'DELETE',
        });
    },
};
