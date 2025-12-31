import { apiClient } from '../api';

export interface Transaction {
    id: string;
    txHash: string;
    network: string;
    type: string;
    status: string;
    amount?: string;
    token?: string;
    agentId?: string;
    agent?: {
        id: string;
        name: string;
        type: string;
    };
    createdAt: string;
    updatedAt: string;
}

export const transactionsApi = {
    getAll: async (filters?: { status?: string; type?: string }): Promise<Transaction[]> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiClient<Transaction[]>(`/transactions${query}`);
    },

    getById: async (id: string): Promise<Transaction> => {
        return apiClient<Transaction>(`/transactions/${id}`);
    },

    getByAgent: async (agentId: string): Promise<Transaction[]> => {
        return apiClient<Transaction[]>(`/transactions/agent/${agentId}`);
    },
};
