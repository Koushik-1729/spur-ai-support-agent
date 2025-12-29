import { writable } from 'svelte/store';
import { browser } from '$app/environment';

interface User {
    email: string;
    role: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    token: null,
    user: null,
    isAuthenticated: false,
};

// Load from localStorage if available
if (browser) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token) {
        initialState.token = token;
        initialState.isAuthenticated = true;
        if (userStr) {
            try {
                initialState.user = JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
            }
        }
    }
}

function createAuthStore() {
    const { subscribe, set, update } = writable<AuthState>(initialState);

    return {
        subscribe,
        login: (token: string, user: User) => {
            if (browser) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            set({ token, user, isAuthenticated: true });
        },
        logout: () => {
            if (browser) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
            set({ token: null, user: null, isAuthenticated: false });
        },
        updateUser: (user: User) => {
            if (browser) {
                localStorage.setItem('user', JSON.stringify(user));
            }
            update(state => ({ ...state, user }));
        }
    };
}

export const auth = createAuthStore();
