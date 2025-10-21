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
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const { loginAsync } = useCustomerAuth();

    const isLoading = useAuthStore((state) => state.isLoading);

    const { control, handleSubmit, setError, formState: { errors } } = useForm<LoginRequest>({
        mode: 'onSubmit',
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const onSubmit = async (data: LoginRequest) => {
        try {
            await loginAsync(data);
        } catch (error: any) {
            const msg = error?.message;
            if (msg.toLowerCase().includes('password')) {
                setError('password', { type: 'server', message: msg });
            } else {
                setError('email', { type: 'server', message: msg });
            }
        }
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
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
                                Welcome to Printify!
                            </StyledText>
                            <StyledText variant="lexend" className="text-xl text-gray-600">
                                Log in using your Printify account
                            </StyledText>
                        </View>

                        {/* Form */}
                        <View className="mb-6 px-1">
                            {/* Email Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-xl text-primary mb-2">
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
                                    <StyledText variant="lexend" className="text-lg text-red-500 mt-1">
                                        {errors.email.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* Password Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-xl text-primary mb-2">
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
                                                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={30} color="#6B7280" />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                />
                                {errors.password && (
                                    <StyledText variant="lexend" className="text-lg text-red-500 mt-1">
                                        {errors.password.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* Forgot Password Link */}
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/forgot')}
                                disabled={isLoading}
                                className="self-start"
                            >
                                <StyledText variant="lexend-medium" className="text-lg text-secondary">
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
                                <StyledText variant="lexend-semibold" className="text-white text-2xl">
                                    Sign In
                                </StyledText>
                            )}
                        </TouchableOpacity>

                        {/* Register Link */}
                        <View className="flex-row justify-center items-center">
                            <StyledText variant="lexend" className="text-gray-600 text-xl">
                                Don&apos;t have an account?{' '}
                            </StyledText>
                            <TouchableOpacity
                                onPress={() => router.push('/(auth)/register')}
                                disabled={isLoading}
                            >
                                <StyledText variant="lexend-semibold" className="text-secondary text-xl">
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