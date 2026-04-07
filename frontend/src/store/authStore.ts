import { create } from 'zustand';
import api from '../lib/api';           // ← We'll use the centralized api
import { AxiosError } from 'axios';

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (username: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,

    login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/auth/login', { username, password });
            const { token } = response.data;

            localStorage.setItem('token', token);
            set({
                token,
                isAuthenticated: true,
                // user can be populated later if you add /me endpoint
            });
        } catch (error) {
            const err = error as AxiosError<any>;
            const message =
                typeof err.response?.data === 'string'
                    ? err.response.data
                    : err.response?.data?.message || 'Invalid username or password';

            throw new Error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
            await api.post('/users/register', { username, email, password });
        } catch (error) {
            const err = error as AxiosError<any>;
            const message =
                err.response?.data?.message || 'Registration failed';

            throw new Error(message);
        } finally {
            set({ isLoading: false });
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });
    }
}));