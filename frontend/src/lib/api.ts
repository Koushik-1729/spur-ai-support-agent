import { auth } from './stores/auth.store';
import { get } from 'svelte/store';
import { env } from '$env/dynamic/public';

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const BASE_URL = RAW_BASE_URL.replace(/\/+$/, ''); // Remove trailing slashes

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;

    // Build URL
    const url = new URL(`${BASE_URL}${endpoint}`);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    // Add headers
    const headers = new Headers(init.headers);
    headers.set('Content-Type', 'application/json');

    // Add auth token
    const token = get(auth).token;
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url.toString(), {
        ...init,
        headers,
    });

    if (response.status === 401 || response.status === 403) {
        auth.logout();
        // Redirect to login if needed, or handle in component
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Request failed: ${response.statusText}`);
    }

    return response.json();
}

export const api = {
    get: <T>(endpoint: string, params?: Record<string, string>) => request<T>(endpoint, { method: 'GET', params }),
    post: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T>(endpoint: string, body: any) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
