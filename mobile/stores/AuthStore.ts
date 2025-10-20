import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Customer } from '@/types/Customer.types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface State {
    customer: Customer | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

interface Actions {
    setCustomer: (customer: Customer | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    fetchCustomer: () => Promise<void>;
    clearAuth: () => Promise<void>;
}

const clearStoredData = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

const useAuthStore = create<State & Actions>((set, get) => ({
    customer: null,
    isAuthenticated: false,
    isLoading: false,

    setCustomer: (customer) => {
        set({ customer, isAuthenticated: !!customer });
    },
    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
    setIsLoading: (isLoading) => set({ isLoading }),

    fetchCustomer: async () => {
        set({ isLoading: true });
        try {
            const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
            if (!token) {
                set({ customer: null, isAuthenticated: false, isLoading: false });
                return;
            }
        } catch (error) {
            
        }
    },

    clearAuth: async () => {
        await clearStoredData();
        set({ customer: null, isAuthenticated: false, isLoading: false });
    }
}));

export default useAuthStore