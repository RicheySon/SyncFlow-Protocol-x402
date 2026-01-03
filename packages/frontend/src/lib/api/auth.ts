import { apiClient, TokenManager, UserManager } from '../api';

export interface SignupData {
    email: string;
    password: string;
    name?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name?: string;
        role: string;
    };
    token: string;
}

export const authApi = {
    signup: async (data: SignupData): Promise<AuthResponse> => {
        const response = await apiClient<AuthResponse>('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        TokenManager.setToken(response.token);
        UserManager.setUser(response.user);
        return response;
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await apiClient<AuthResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        });

        TokenManager.setToken(response.token);
        UserManager.setUser(response.user);
        return response;
    },

    logout: () => {
        TokenManager.clearToken();
        UserManager.clearUser();
    },
};
