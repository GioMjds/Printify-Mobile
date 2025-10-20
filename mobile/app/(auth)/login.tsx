import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { router } from "expo-router";
import StyledText from "@/components/ui/StyledText";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import useAuthStore from "@/stores/AuthStore";
import { LoginRequest } from "@/types/UserAuth.types";

export default function LoginScreen() {
    const { login } = useCustomerAuth();

    const isLoading = useAuthStore((state) => state.isLoading);

    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, formState: { errors } } = useForm<LoginRequest>({
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = (data: LoginRequest) => login(data);

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
                            <Image
                                source={require("@/assets/images/printify.png")}
                                className="w-32 h-32 mb-4"
                            />

                            <StyledText variant="lexend-bold" className="text-5xl text-primary mb-2">
                                Welcome Back
                            </StyledText>
                            <StyledText variant="lexend" className="text-lg text-gray-600">
                                Sign in to continue to Printify
                            </StyledText>
                        </View>

                        {/* Form */}
                        <View className="mb-6 px-1">
                            {/* Email Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-base text-primary mb-2">
                                    Email Address
                                </StyledText>
                                <Controller
                                    control={control}
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
                                            className="border border-gray-300 rounded-xl px-5 py-4 text-lg font-lexend"
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
                                {errors.email && (
                                    <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                        {errors.email.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* Password Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-base text-primary mb-2">
                                    Password
                                </StyledText>
                                <Controller
                                    control={control}
                                    name="password"
                                    rules={{
                                        required: 'Password is required',
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <View className="relative">
                                            <TextInput
                                                className="border border-gray-300 rounded-xl px-5 py-4 text-lg font-lexend pr-12"
                                                placeholder="Enter your password"
                                                placeholderTextColor="#9CA3AF"
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                secureTextEntry={!showPassword}
                                                editable={!isLoading}
                                            />
                                            <TouchableOpacity
                                                activeOpacity={0.7}
                                                onPress={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3"
                                            >
                                                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {errors.password && (
                                    <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                        {errors.password.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/forgot')}
                                disabled={isLoading}
                                className="self-end"
                            >
                                <StyledText variant="lexend-medium" className="text-sm text-secondary">
                                    Forgot Password?
                                </StyledText>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className={`bg-primary rounded-xl py-4 items-center justify-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <StyledText variant="lexend-semibold" className="text-white text-base">
                                    Sign In
                                </StyledText>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View className="flex-row justify-center items-center">
                            <StyledText variant="lexend" className="text-gray-600 text-sm">
                                Don&apos;t have an account?{' '}
                            </StyledText>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                disabled={isLoading}
                            >
                                <StyledText variant="lexend-semibold" className="text-secondary text-sm">
                                    Sign Up
                                </StyledText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}