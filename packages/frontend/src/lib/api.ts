// Base API client configuration
// Base API client configuration
// Base API client configuration
const API_BASE_URL = '/api'; // Hardcoded for Unified Vercel Deployment to prevent localhost pollution

// Token management
export const TokenManager = {
    getToken: () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('authToken');
    },

    setToken: (token: string) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('authToken', token);
    },

    clearToken: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('authToken');
    },
};

export const UserManager = {
    getUser: () => {
        if (typeof window === 'undefined') return null;
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    setUser: (user: any) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('user', JSON.stringify(user));
    },

    clearUser: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('user');
    },
};

// Base fetch wrapper with auth
export async function apiClient<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = TokenManager.getToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}` as string;
    }

    // Handle relative path for Unified Deployment
    const baseUrl = API_BASE_URL.startsWith('/')
        ? `${window.location.origin}${API_BASE_URL}`
        : API_BASE_URL;

    const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
