import {
	View,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Image,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import StyledText from '@/components/ui/StyledText';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import useAuthStore from '@/stores/AuthStore';
import { RegisterRequest } from '@/types/UserAuth.types';

export default function RegisterScreen() {
	const [showPassword, setShowPassword] = useState<boolean>(false);
	const [showConfirm, setShowConfirm] = useState<boolean>(false);

	const { sendRegisterOtpAsync } = useCustomerAuth();
	const isLoading = useAuthStore((state) => state.isLoading);

    const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<RegisterRequest>({
		mode: 'onSubmit',
        defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const password = watch('password');

	const onSubmit = async (data: RegisterRequest) => {
		await sendRegisterOtpAsync(data);
	};

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
					<View className="flex-1 px-6 justify-center py-8">
						{/* Header */}
						<View className="mb-8 items-center">
							<Image
								source={require('@/assets/images/printify.png')}
								className="w-32 h-32 mb-4"
							/>
							<StyledText
								variant="lexend-bold"
								className="text-5xl text-primary mb-2"
							>
								Create Account
							</StyledText>
							<StyledText
								variant="lexend"
								className="text-lg text-gray-600"
							>
								Sign up to get started with Printify
							</StyledText>
						</View>

						{/* Form */}
						<View className="mb-6">
                            <View className="flex-row space-x-4">
                                <View className="flex-1 mx-2">
                                    {/* First Name Input */}
                                    <View className="mb-4">
                                        <StyledText
                                            variant="lexend-medium"
                                            className="text-xl text-primary mb-2"
                                        >
                                            First Name
                                        </StyledText>
                                        <Controller
                                            control={control}
                                            name="firstName"
                                            rules={{
                                                required: 'First name is required',
                                                minLength: {
                                                    value: 2,
                                                    message:
                                                        'First name must be at least 2 characters',
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-lexend"
                                                    placeholder="Enter your first name"
                                                    placeholderTextColor="#9CA3AF"
                                                    onBlur={onBlur}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    editable={!isLoading}
                                                />
                                            )}
                                        />
                                        {errors.firstName && (
                                            <StyledText
                                                variant="lexend"
                                                className="text-sm text-red-500 mt-1"
                                            >
                                                {errors.firstName.message}
                                            </StyledText>
                                        )}
                                    </View>
                                </View>

                                <View className="flex-1 mx-2">
                                    {/* Last Name Input */}
                                    <View className="mb-4">
                                        <StyledText
                                            variant="lexend-medium"
                                            className="text-xl text-primary mb-2"
                                        >
                                            Last Name
                                        </StyledText>
                                        <Controller
                                            control={control}
                                            name="lastName"
                                            rules={{
                                                required: 'Last name is required',
                                                minLength: {
                                                    value: 2,
                                                    message:
                                                        'Last name must be at least 2 characters',
                                                },
                                            }}
                                            render={({ field: { onChange, onBlur, value } }) => (
                                                <TextInput
                                                    className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-lexend"
                                                    placeholder="Enter your last name"
                                                    placeholderTextColor="#9CA3AF"
                                                    onBlur={onBlur}
                                                    onChangeText={onChange}
                                                    value={value}
                                                    editable={!isLoading}
                                                />
                                            )}
                                        />
                                        {errors.lastName && (
                                            <StyledText
                                                variant="lexend"
                                                className="text-sm text-red-500 mt-1"
                                            >
                                                {errors.lastName.message}
                                            </StyledText>
                                        )}
                                    </View>
                                </View>
                            </View>

							{/* Email Input */}
							<View className="mb-4 mx-2">
								<StyledText
									variant="lexend-medium"
									className="text-xl text-primary mb-2"
								>
									Email Address
								</StyledText>
								<Controller
									control={control}
									name="email"
									rules={{
										required: 'Email is required',
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: 'Invalid email address',
										},
									}}
									render={({
										field: { onChange, onBlur, value },
									}) => (
										<TextInput
											className="border border-gray-300 rounded-xl px-4 py-3 text-lg font-lexend"
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
									<StyledText
										variant="lexend"
										className="text-sm text-red-500 mt-1"
									>
										{errors.email.message}
									</StyledText>
								)}
							</View>

							{/* Password Input */}
							<View className="mb-4 mx-2">
                                <StyledText
                                    variant="lexend-medium"
                                    className="text-xl text-primary mb-2"
                                >
                                    Password
                                </StyledText>
                                <Controller
                                    control={control}
                                    name="password"
                                    rules={{
                                        required: 'Password is required',
                                        pattern: {
                                            value: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                                            message:
                                                'Password must be at least 8 characters and include a capital letter, a number, and a special character',
                                        },
                                        minLength: {
                                            value: 8,
                                            message:
                                                'Password must be at least 8 characters',
                                        }
                                    }}
                                    render={({ field: { onChange, onBlur, value } }) => (
										<View className="relative">
											<TextInput
												className="border border-gray-300 rounded-xl px-5 py-4 text-lg font-lexend pr-12"
												placeholder="Create a password"
												placeholderTextColor="#9CA3AF"
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
												secureTextEntry={!showPassword}
												editable={!isLoading}
											/>
											<TouchableOpacity
												className="absolute right-3 top-3"
												onPress={() => setShowPassword(!showPassword)}
											>
												<Ionicons
													name={showPassword ? 'eye' : 'eye-off'}
													size={30}
													color="#6B7280"
												/>
											</TouchableOpacity>
										</View>
									)}
								/>
								{errors.password && (
									<StyledText
										variant="lexend"
										className="text-sm text-red-500 mt-1"
									>
										{errors.password.message}
									</StyledText>
								)}
							</View>

							{/* Confirm Password Input */}
							<View className="mb-4 mx-2">
								<StyledText
									variant="lexend-medium"
									className="text-xl text-primary mb-2"
								>
									Confirm Password
								</StyledText>
								<Controller
									control={control}
									name="confirmPassword"
									rules={{
										required: 'Please confirm your password',
										validate: (value) =>
											value === password ||
											'Passwords do not match',
									}}
									render={({
										field: { onChange, onBlur, value },
									}) => (
										<View className="relative">
											<TextInput
												className="border border-gray-300 rounded-xl px-5 py-4 text-lg font-lexend pr-12"
												placeholder="Confirm your password"
												placeholderTextColor="#9CA3AF"
												onBlur={onBlur}
												onChangeText={onChange}
												value={value}
												secureTextEntry={!showConfirm}
												editable={!isLoading}
											/>
											<TouchableOpacity
												className="absolute right-3 top-3"
												onPress={() => setShowConfirm(!showConfirm)}
											>
												<Ionicons
													name={showConfirm ? 'eye' : 'eye-off'}
													size={30}
													color="#6B7280"
												/>
											</TouchableOpacity>
										</View>
									)}
								/>
								{errors.confirmPassword && (
									<StyledText
										variant="lexend"
										className="text-sm text-red-500 mt-1"
									>
										{errors.confirmPassword.message}
									</StyledText>
								)}
							</View>
						</View>

						{/* Register Button */}
						<TouchableOpacity
							onPress={handleSubmit(onSubmit)}
							disabled={isLoading}
							className={`bg-primary rounded-xl py-4 items-center justify-center mb-4 ${isLoading ? 'opacity-70' : ''}`}
						>
							{isLoading ? (
								<ActivityIndicator color="#FFFFFF" />
							) : (
								<StyledText
									variant="lexend-semibold"
									className="text-white text-2xl"
								>
									Create Account
								</StyledText>
							)}
						</TouchableOpacity>

						{/* Login Link */}
						<View className="flex-row justify-center items-center">
							<StyledText
								variant="lexend"
								className="text-gray-600 text-xl"
							>
								Already have an account?{' '}
							</StyledText>
							<TouchableOpacity
								onPress={() => router.push('/(auth)/login')}
								disabled={isLoading}
							>
								<StyledText
									variant="lexend-semibold"
									className="text-secondary text-xl"
								>
									Sign In
								</StyledText>
							</TouchableOpacity>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
