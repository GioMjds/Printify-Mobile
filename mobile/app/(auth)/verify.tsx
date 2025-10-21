import {
	View,
	TextInput,
	TouchableOpacity,
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Image,
	Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useForm } from 'react-hook-form';
import React, { useRef, useState, useEffect } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import StyledText from '@/components/ui/StyledText';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import useAuthStore from '@/stores/AuthStore';
import { VerifyOtpRequest } from '@/types/UserAuth.types';

export default function VerifyScreen() {
	const params = useLocalSearchParams();
	const email = (params.email as string) || '';

	const { verifyRegisterOtpAsync, resendRegisterOtpAsync } =
		useCustomerAuth();
	const isLoading = useAuthStore((state) => state.isLoading);
	const {
		handleSubmit,
		setValue,
		formState: { errors },
	} = useForm<VerifyOtpRequest>({
		defaultValues: {
			email: email,
			otp: '',
		},
	});

	const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
	const inputsRef = useRef<(TextInput | null)[]>([]);

	useEffect(() => {
		setValue('email', email);
	}, [email, setValue]);

	useEffect(() => {
		const otp = digits.join('');
		setValue('otp', otp);
	}, [digits, setValue]);

	const focusInput = (index: number) => {
		const input = inputsRef.current[index];
		if (input) input.focus();
	};

	const handleChangeText = (text: string, index: number) => {
		// handle paste (multiple chars)
		if (!text) {
			const next = [...digits];
			next[index] = '';
			setDigits(next);
			return;
		}

		const chars = text.split('');
		if (chars.length === 1) {
			const next = [...digits];
			next[index] = chars[0];
			setDigits(next);
			// move focus to next
			if (index < 5) focusInput(index + 1);
			return;
		}

		// pasted longer string -> fill from index
		const next = [...digits];
		for (let i = 0; i < chars.length && index + i < 6; i++) {
			next[index + i] = chars[i];
		}
		setDigits(next);
		// focus the first empty input after paste or last
		const firstEmpty = next.findIndex((d) => d === '');
		if (firstEmpty !== -1) focusInput(firstEmpty);
		else focusInput(5);
	};

	const handleKeyPress = ({ nativeEvent }: any, index: number) => {
		if (nativeEvent.key === 'Backspace') {
			if (digits[index]) {
				// clear current
				const next = [...digits];
				next[index] = '';
				setDigits(next);
			} else if (index > 0) {
				// move to previous and clear
				focusInput(index - 1);
				const next = [...digits];
				next[index - 1] = '';
				setDigits(next);
			}
		}
	};

	const onSubmit = async (data: VerifyOtpRequest) => {
		try {
			const response = await verifyRegisterOtpAsync(data);
			if (response && response.userId) {
				Alert.alert('Success', 'Your account has been verified. Please log in.');
				router.replace('/(auth)/login');
			}
		} catch (err: any) {
			const msg = err?.message || 'Failed to verify code';
			Alert.alert('Verification failed', msg);
		}
	};

	const handleResendOTP = async () => {
		if (!email) {
			Alert.alert('No email', 'No email provided to resend OTP');
			return;
		}

		try {
			await resendRegisterOtpAsync(email);
			setDigits(Array(6).fill(''));
			focusInput(0);
		} catch (err: any) {
			const msg = err?.message || 'Unable to resend OTP';
			Alert.alert('Resend failed', msg);
		}
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
					<View className="flex-1 px-6 justify-center">
						{/* Header */}
						<View className="mb-4 items-center">
							<Image
								source={require('@/assets/images/printify.png')}
								className="w-32 h-32 mb-4"
							/>
							<StyledText
								variant="lexend-bold"
								className="text-5xl text-primary mb-2"
							>
								Verify Email
							</StyledText>
							<StyledText
								variant="lexend"
								className="text-lg text-gray-600"
							>
								We&apos;ve sent a verification code to
							</StyledText>
							<StyledText
								variant="lexend-medium"
								className="text-lg text-secondary mt-1"
							>
								{email}
							</StyledText>
						</View>

						{/* Form */}
						<View className="mb-2">
							{/* OTP Input */}
							<View className="mb-4">
								<View className="flex-row justify-center space-x-2">
									{digits.map((d, i) => (
										<TextInput
											key={i}
											ref={(el) => {
												inputsRef.current[i] = el;
											}}
											value={d}
											onChangeText={(t) =>
												handleChangeText(t, i)
											}
											onKeyPress={(e) =>
												handleKeyPress(e, i)
											}
											keyboardType="number-pad"
											editable={!isLoading}
											maxLength={1}
											className="border border-gray-300 rounded-xl px-4 py-3 mx-2 font-lexend text-center text-3xl w-14 h-14"
											placeholder="•"
											placeholderTextColor="#9CA3AF"
										/>
									))}
								</View>
								{errors.otp && (
									<StyledText
										variant="lexend"
										className="text-xs text-red-500 mt-1 text-center"
									>
										{errors.otp.message}
									</StyledText>
								)}
							</View>

							{/* Resend OTP */}
							<View className="flex-row justify-center items-center mb-2">
								<StyledText
									variant="lexend"
									className="text-gray-600 text-xl"
								>
									Didn&apos;t receive the code?{' '}
								</StyledText>
								<TouchableOpacity
									onPress={handleResendOTP}
									disabled={isLoading}
								>
									<StyledText
										variant="lexend-semibold"
										className="text-secondary text-xl"
									>
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
								<StyledText
									variant="lexend-semibold"
									className="text-white text-2xl"
								>
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
								<StyledText
									variant="lexend-medium"
									className="text-gray-600 text-xl"
								>
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
