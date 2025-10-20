import { useState } from "react";
import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import StyledText from "@/components/ui/StyledText";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import useAuthStore from "@/stores/AuthStore";
import { ResetPasswordRequest } from "@/types/UserAuth.types";
import { Ionicons } from '@expo/vector-icons';

export default function ForgotScreen() {
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const { forgotPassword, resetPassword } = useCustomerAuth();
    const isLoading = useAuthStore((state) => state.isLoading);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    
    const emailForm = useForm<{ email: string }>({
        defaultValues: { email: '' }
    });

    const resetForm = useForm<ResetPasswordRequest>({
        defaultValues: {
            email: '',
            otp: '',
            newPassword: '',
            confirmNewPassword: ''
        }
    });

    const newPassword = resetForm.watch('newPassword');

    const onSendOTP = (data: { email: string }) => {
        setEmail(data.email);
        forgotPassword(data.email);
        setStep('reset');
    };

    const onResetPassword = (data: ResetPasswordRequest) => {
        resetPassword({ ...data, email });
    };

    if (step === 'email') {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <ScrollView
                        contentContainerStyle={{ flexGrow: 1 }}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View className="flex-1 px-6 justify-center">
                                {/* Header */}
                                <View className="mb-10 items-center">
                                    <Image source={require("@/assets/images/printify.png")} className="w-32 h-32 mb-4" />
                                    <StyledText variant="lexend-bold" className="text-5xl text-primary mb-2">
                                        Forgot Password?
                                    </StyledText>
                                    <StyledText variant="lexend" className="text-lg text-gray-600">
                                        Enter your email address and we&apos;ll send you a code to reset your password
                                    </StyledText>
                                </View>

                            {/* Form */}
                            <View className="mb-6">
                                {/* Email Input */}
                                <View className="mb-4">
                                    <StyledText variant="lexend-medium" className="text-sm text-primary mb-2">
                                        Email Address
                                    </StyledText>
                                    <Controller
                                        control={emailForm.control}
                                        name="email"
                                        rules={{
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Invalid email address'
                                            }
                                        }}
                                        render={({ field: { onChange, onBlur, value } }) => (
                                            <TextInput
                                                className="border border-gray-300 rounded-xl px-4 py-3 text-base font-lexend"
                                                placeholder="Enter your email"
                                                placeholderTextColor="#9CA3AF"
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                editable={!isLoading}
                                            />
                                        )}
                                    />
                                    {emailForm.formState.errors.email && (
                                        <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                            {emailForm.formState.errors.email.message}
                                        </StyledText>
                                    )}
                                </View>
                            </View>

                            {/* Send Code Button */}
                            <TouchableOpacity
                                onPress={emailForm.handleSubmit(onSendOTP)}
                                disabled={isLoading}
                                className={`bg-primary rounded-xl py-4 items-center justify-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <StyledText variant="lexend-semibold" className="text-white text-base">
                                        Send Reset Code
                                    </StyledText>
                                )}
                            </TouchableOpacity>

                            {/* Back to Login Link */}
                            <View className="flex-row justify-center items-center">
                                <TouchableOpacity
                                    onPress={() => router.push('/(auth)/login')}
                                    disabled={isLoading}
                                >
                                    <StyledText variant="lexend-medium" className="text-gray-600 text-sm">
                                        Back to Sign In
                                    </StyledText>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Reset Password Step
    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 px-6 justify-center py-8">
                        {/* Header */}
                        <View className="mb-8">
                            <StyledText variant="lexend-bold" className="text-4xl text-primary mb-2">
                                Reset Password
                            </StyledText>
                            <StyledText variant="lexend" className="text-base text-gray-600">
                                Enter the code sent to
                            </StyledText>
                            <StyledText variant="lexend-medium" className="text-base text-secondary mt-1">
                                {email}
                            </StyledText>
                        </View>

                        {/* Form */}
                        <View className="mb-6">
                            {/* OTP Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-sm text-primary mb-2">
                                    Verification Code
                                </StyledText>
                                <Controller
                                    control={resetForm.control}
                                    name="otp"
                                    rules={{
                                        required: 'Verification code is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Verification code must be 6 digits'
                                        },
                                        pattern: {
                                            value: /^[0-9]{6}$/,
                                            message: 'Verification code must be 6 digits'
                                        }
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            className="border border-gray-300 rounded-xl px-4 py-3 text-base font-lexend text-center tracking-widest"
                                            placeholder="000000"
                                            placeholderTextColor="#9CA3AF"
                                            onBlur={onBlur}
                                            onChangeText={onChange}
                                            value={value}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            editable={!isLoading}
                                        />
                                    )}
                                />
                                {resetForm.formState.errors.otp && (
                                    <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                        {resetForm.formState.errors.otp.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* New Password Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-sm text-primary mb-2">
                                    New Password
                                </StyledText>
                                    <Controller
                                    control={resetForm.control}
                                    name="newPassword"
                                    rules={{
                                        required: 'New password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <View className="relative">
                                            <TextInput
                                                className="border border-gray-300 rounded-xl px-5 py-4 text-lg font-lexend pr-12"
                                                placeholder="Enter new password"
                                                placeholderTextColor="#9CA3AF"
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                secureTextEntry={!showNew}
                                                editable={!isLoading}
                                            />
                                            <TouchableOpacity className="absolute right-3 top-3" onPress={() => setShowNew(!showNew)}>
                                                <Ionicons name={showNew ? 'eye' : 'eye-off'} size={24} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {resetForm.formState.errors.newPassword && (
                                    <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                        {resetForm.formState.errors.newPassword.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* Confirm New Password Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-sm text-primary mb-2">
                                    Confirm New Password
                                </StyledText>
                                <Controller
                                    control={resetForm.control}
                                    name="confirmNewPassword"
                                    rules={{
                                        required: 'Please confirm your password',
                                        validate: value => value === newPassword || 'Passwords do not match'
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <View className="relative">
                                            <TextInput
                                                className="border border-gray-300 rounded-xl px-5 py-4 text-lg font-lexend pr-12"
                                                placeholder="Confirm new password"
                                                placeholderTextColor="#9CA3AF"
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                secureTextEntry={!showConfirm}
                                                editable={!isLoading}
                                            />
                                            <TouchableOpacity className="absolute right-3 top-3" onPress={() => setShowConfirm(!showConfirm)}>
                                                <Ionicons name={showConfirm ? 'eye' : 'eye-off'} size={24} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {resetForm.formState.errors.confirmNewPassword && (
                                    <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                        {resetForm.formState.errors.confirmNewPassword.message}
                                    </StyledText>
                                )}
                            </View>
                        </View>

                        {/* Reset Password Button */}
                        <TouchableOpacity
                            onPress={resetForm.handleSubmit(onResetPassword)}
                            disabled={isLoading}
                            className={`bg-primary rounded-xl py-4 items-center justify-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <StyledText variant="lexend-semibold" className="text-white text-base">
                                    Reset Password
                                </StyledText>
                            )}
                        </TouchableOpacity>

                        {/* Back to Login Link */}
                        <View className="flex-row justify-center items-center">
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/login')}
                                disabled={isLoading}
                            >
                                <StyledText variant="lexend-medium" className="text-gray-600 text-sm">
                                    Back to Sign In
                                </StyledText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}