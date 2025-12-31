import { apiClient } from '../api';

export interface Workflow {
    id: string;
    name: string;
    description?: string;
    status: 'draft' | 'active' | 'completed';
    steps: string;
    trigger?: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkflowData {
    name: string;
    description?: string;
    steps: string;
    trigger?: string;
}

export interface UpdateWorkflowData {
    name?: string;
    description?: string;
    status?: 'draft' | 'active' | 'completed';
    steps?: string;
    trigger?: string;
}

export const workflowsApi = {
    getAll: async (): Promise<Workflow[]> => {
        return apiClient<Workflow[]>('/workflows');
    },

    getById: async (id: string): Promise<Workflow> => {
        return apiClient<Workflow>(`/workflows/${id}`);
    },

    create: async (data: CreateWorkflowData): Promise<Workflow> => {
        return apiClient<Workflow>('/workflows', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    update: async (id: string, data: UpdateWorkflowData): Promise<Workflow> => {
        return apiClient<Workflow>(`/workflows/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    delete: async (id: string): Promise<{ message: string }> => {
        return apiClient<{ message: string }>(`/workflows/${id}`, {
            method: 'DELETE',
        });
    },
};
