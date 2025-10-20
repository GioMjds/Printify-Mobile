import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { router, useLocalSearchParams } from "expo-router";
import StyledText from "@/components/ui/StyledText";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import useAuthStore from "@/stores/AuthStore";
import { VerifyOtpRequest } from "@/types/UserAuth.types";

export default function VerifyScreen() {
    const params = useLocalSearchParams();
    const email = params.email as string || '';
    
    const { verifyRegisterOtp, resendRegisterOtp } = useCustomerAuth();
    const isLoading = useAuthStore((state) => state.isLoading);
    const { control, handleSubmit, formState: { errors } } = useForm<VerifyOtpRequest>({
        defaultValues: {
            email: email,
            otp: ''
        }
    });

    const onSubmit = (data: VerifyOtpRequest) => {
        verifyRegisterOtp(data);
    };

    const handleResendOTP = () => {
        if (email) {
            resendRegisterOtp(email);
        }
    };

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
                                Verify Email
                            </StyledText>
                            <StyledText variant="lexend" className="text-lg text-gray-600">
                                We&apos;ve sent a verification code to
                            </StyledText>
                            <StyledText variant="lexend-medium" className="text-lg text-secondary mt-1">
                                {email}
                            </StyledText>
                        </View>

                        {/* Form */}
                        <View className="mb-6">
                            {/* Email Display */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-sm text-primary mb-2">
                                    Email Address
                                </StyledText>
                                <View className="border border-gray-200 bg-gray-50 rounded-xl px-4 py-3">
                                    <StyledText variant="lexend" className="text-base text-gray-600">
                                        {email}
                                    </StyledText>
                                </View>
                            </View>

                            {/* OTP Input */}
                            <View className="mb-4">
                                <StyledText variant="lexend-medium" className="text-sm text-primary mb-2">
                                    Verification Code
                                </StyledText>
                                <Controller
                                    control={control}
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
                                {errors.otp && (
                                    <StyledText variant="lexend" className="text-xs text-red-500 mt-1">
                                        {errors.otp.message}
                                    </StyledText>
                                )}
                            </View>

                            {/* Resend OTP */}
                            <View className="flex-row justify-center items-center mb-2">
                                <StyledText variant="lexend" className="text-gray-600 text-sm">
                                    Didn&apos;t receive the code?{' '}
                                </StyledText>
                                <TouchableOpacity
                                    onPress={handleResendOTP}
                                    disabled={isLoading}
                                >
                                    <StyledText variant="lexend-semibold" className="text-secondary text-sm">
                                        Resend
                                    </StyledText>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Verify Button */}
                        <TouchableOpacity
                            onPress={handleSubmit(onSubmit)}
                            disabled={isLoading}
                            className={`bg-primary rounded-xl py-4 items-center justify-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <StyledText variant="lexend-semibold" className="text-white text-base">
                                    Verify Email
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