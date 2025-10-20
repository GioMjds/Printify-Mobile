import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/routes/UserAuth.routes";
import * as SecureStore from 'expo-secure-store';
import useAuthStore from "@/stores/AuthStore";
import { LoginRequest, RegisterRequest, ResetPasswordRequest, VerifyOtpRequest } from "@/types/UserAuth.types";
import { CustomerResponse } from "@/types/Customer.types";

const ACCESS_TOKEN_KEY = 'access_token';
const CUSTOMER_ID = 'customer_id';

const storeTokens = async (accessToken: string, customerId: string) => {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(CUSTOMER_ID, customerId);
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
        onMutate: () => setIsLoading(true),
        onSuccess: async (data: CustomerResponse) => {
            if (data.customer && data.access_token) {
                await storeTokens(data.access_token, data.customer.id);
                setCustomer(data.customer);
                setIsAuthenticated(true);
                queryClient.invalidateQueries({ queryKey: ['customer'] });
            }
        },
        onError: (error) => console.error('Login error:', error),
        onSettled: () => setIsLoading(false),
    });

    const logoutMutation = useMutation({
        mutationFn: async () => await auth.logout(),
        onMutate: () => setIsLoading(true),
        onSuccess: async () => {
            await deleteStoredTokens();
            setCustomer(null);
            setIsAuthenticated(false);
            queryClient.clear();
        },
        onError: () => console.error('Logout error'),
        onSettled: () => setIsLoading(false),
    });

    const registerMutation = useMutation({
        mutationFn: async (payload: RegisterRequest) => await auth.sendRegisterOtp(payload),
        onMutate: () => setIsLoading(true),
        onSuccess: async (data, variables) => {
            queryClient.setQueryData(['registerOtp', variables.email], data);
            await SecureStore.setItemAsync('pending_register_email', variables.email);
        },
        onError: (err) => console.error('Register (send OTP) error:', err),
        onSettled: () => setIsLoading(false),
    });

    const verifyRegisterOtpMutation = useMutation({
        mutationFn: async ({ email, otp }: VerifyOtpRequest) => await auth.verifyRegisterOtp(email, otp),
        onMutate: () => setIsLoading(true),
        onSuccess: async (data, variables) => {
            queryClient.setQueryData(['verifyRegisterOtp', variables.email], data);
            await SecureStore.deleteItemAsync('pending_register_email');
        },
        onError: (err) => console.error('Verify OTP error:', err),
        onSettled: () => setIsLoading(false),
    });

    const resendRegisterOtpMutation = useMutation({
        mutationFn: async (email: string) => await auth.resendRegisterOtp(email),
        onMutate: () => setIsLoading(true),
        onSuccess: async (data, email) => {
            queryClient.setQueryData(['registerOtp', email], data);
        },
        onError: (err) => console.error('Resend OTP error:', err),
        onSettled: () => setIsLoading(false),
    });

    const forgotPasswordMutation = useMutation({
        mutationFn: async (email: string) => await auth.forgotPassword(email),
        onMutate: () => setIsLoading(true),
        onSuccess: async (data, email) => {
            queryClient.setQueryData(['forgotPassword', email], data);
            await SecureStore.setItemAsync('reset_password_email', email);
        },
        onError: (err) => console.error('Forgot password error:', err),
        onSettled: () => setIsLoading(false),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: async ({ email, otp, newPassword, confirmNewPassword }: ResetPasswordRequest) =>
            await auth.resetPassword(email, otp, newPassword, confirmNewPassword),
        onMutate: () => setIsLoading(true),
        onSuccess: async (data, variables) => {
            queryClient.setQueryData(['resetPassword', variables.email], data);
            await SecureStore.deleteItemAsync('reset_password_email');
        },
        onError: (err) => console.error('Reset password error:', err),
        onSettled: () => setIsLoading(false),
    });

    return {
        login: loginMutation.mutate,
        logout: logoutMutation.mutate,
        sendRegisterOtp: registerMutation.mutate,
        verifyRegisterOtp: verifyRegisterOtpMutation.mutate,
        resendRegisterOtp: resendRegisterOtpMutation.mutate,
        forgotPassword: forgotPasswordMutation.mutate,
        resetPassword: resetPasswordMutation.mutate,
    }
}