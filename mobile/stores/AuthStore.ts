import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Customer } from '@/types/Customer.types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const CUSTOMER_ID_KEY = 'customer_id';

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
    setTokens: (accessToken: string, refreshToken: string, customer: Customer) => Promise<void>;
    fetchCustomer: (customerId: string) => Promise<void>;
    initializeAuth: () => Promise<void>;
    clearAuth: () => Promise<void>;
}

const clearStoredData = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(CUSTOMER_ID_KEY);
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

    setTokens: async (accessToken: string, refreshToken: string, customer: Customer) => {
        try {
            // Store tokens securely
            await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
            await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
            await SecureStore.setItemAsync(CUSTOMER_ID_KEY, customer.id);

            // Update state
            set({ 
                customer,
                isAuthenticated: true,
                isLoading: false 
            });
        } catch (error) {
            console.error('Error storing tokens:', error);
            throw error;
        }
    },

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

            // You can implement a profile fetch endpoint here if needed
            // For now, we'll rely on the customer data from login/register
            set({ isLoading: false });
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

            const customerId = await SecureStore.getItemAsync(CUSTOMER_ID_KEY);
            
            if (customerId) {
                // Token exists and customer ID exists
                // You can fetch fresh customer data here if you have a profile endpoint
                set({ 
                    isAuthenticated: true,
                    isLoading: false,
                    isInitialized: true
                });
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
    },

    clearAuth: async () => {
        await clearStoredData();
        set({ 
            customer: null, 
            isAuthenticated: false, 
            isLoading: false 
        });
    }
}));

export default useAuthStore