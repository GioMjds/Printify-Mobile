import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Customer } from '@/types/Customer.types';
import { customer } from '@/routes/Customer.routes';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

interface State {
    customer: Customer | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
}

interface Actions {
    setCustomer: (customer: Customer | null) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    setIsLoading: (isLoading: boolean) => void;
    setIsInitialized: (isInitialized: boolean) => void;
    fetchCustomer: (customerId: string) => Promise<void>;
    initializeAuth: () => Promise<void>;
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
    isInitialized: false,

    setCustomer: (customer) => {
        set({ customer, isAuthenticated: !!customer });
    },

    setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

    setIsLoading: (isLoading) => set({ isLoading }),

    setIsInitialized: (isInitialized) => set({ isInitialized }),

    fetchCustomer: async (customerId: string) => {
        set({ isLoading: true });
        try {
            const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

            if (!token) {
                set({ 
                    customer: null, 
                    isAuthenticated: false, 
                    isLoading: false 
                });
                return;
            }

            const response = await customer.getCustomerProfile(customerId);
            
            if (response && response.id) {
                set({ 
                    customer: response.data, 
                    isAuthenticated: true,
                    isLoading: false 
                });
            } else {
                throw new Error('Invalid customer response');
            }
        } catch (error) {
            console.error('Error fetching customer profile:', error);
            await clearStoredData();
            set({ 
                customer: null, 
                isAuthenticated: false, 
                isLoading: false 
            });
        }
    },

    initializeAuth: async () => {
        set({ isLoading: true });
        try {
            const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
            
            if (!token) {
                set({ 
                    customer: null, 
                    isAuthenticated: false,
                    isLoading: false,
                    isInitialized: true
                });
                return;
            }

            const customerId = await SecureStore.getItemAsync('customer_id');
            
            if (customerId) {
                await get().fetchCustomer(customerId);
            } else {
                await clearStoredData();
                set({ 
                    customer: null, 
                    isAuthenticated: false,
                    isLoading: false,
                    isInitialized: true
                });
            }
        } catch (error) {
            console.error('Error initializing auth:', error);
            await clearStoredData();
            set({ 
                customer: null, 
                isAuthenticated: false, 
                isLoading: false,
                isInitialized: true
            });
        }

        set({ isInitialized: true });
    },

    // Clear auth and logout
    clearAuth: async () => {
        await clearStoredData();
        await SecureStore.deleteItemAsync('customer_id');
        set({ 
            customer: null, 
            isAuthenticated: false, 
            isLoading: false 
        });
    }
}));

export default useAuthStore