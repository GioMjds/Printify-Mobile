import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/routes/UserAuth.routes";
import * as SecureStore from 'expo-secure-store';
import useAuthStore from "@/stores/AuthStore";
import { LoginRequest } from "@/types/UserAuth.types";

const ACCESS_TOKEN_KEY = 'access_token';

const storeTokens = async (accessToken: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
}

const deleteStoredTokens = async () => {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
}

export function useCustomerAuth() {
    const queryClient = useQueryClient();
    const setCustomer = useAuthStore((state) => state.setCustomer);
    const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);
    const setIsLoading = useAuthStore((state) => state.setIsLoading);

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: LoginRequest) => await auth.login({ email, password }),
        onMutate: () => {
            setIsLoading(true);
        },
        onSuccess: async (data) => {
            if (data.user && data.access_token) {
                await storeTokens(data.access_token);
                setCustomer(data.user);
                setIsAuthenticated(true);
                queryClient.invalidateQueries({ queryKey: ['customer'] });
            }
        },
        onError: (error) => {
            console.error('Login error:', error);
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    const logoutMutation = useMutation({
        mutationFn: async () => await auth.logout(),
        onMutate: () => {
            setIsLoading(true);
        },
        onSuccess: async () => {
            await deleteStoredTokens();
            setCustomer(null);
            setIsAuthenticated(false);
            queryClient.clear();
        },
        onError: () => {
            console.error('Logout error');
        },
        onSettled: () => {
            setIsLoading(false);
        }
    });

    return {
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
    }
}