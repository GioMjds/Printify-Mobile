import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from '@expo-google-fonts/lexend';
import { useEffect } from 'react';

import { Lexend_100Thin } from '@expo-google-fonts/lexend/100Thin';
import { Lexend_200ExtraLight } from '@expo-google-fonts/lexend/200ExtraLight';
import { Lexend_300Light } from '@expo-google-fonts/lexend/300Light';
import { Lexend_400Regular } from '@expo-google-fonts/lexend/400Regular';
import { Lexend_500Medium } from '@expo-google-fonts/lexend/500Medium';
import { Lexend_600SemiBold } from '@expo-google-fonts/lexend/600SemiBold';
import { Lexend_700Bold } from '@expo-google-fonts/lexend/700Bold';
import { Lexend_800ExtraBold } from '@expo-google-fonts/lexend/800ExtraBold';
import { Lexend_900Black } from '@expo-google-fonts/lexend/900Black';
import useAuthStore from '@/stores/AuthStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
	const [fontsLoaded] = useFonts({
		Lexend_100Thin,
		Lexend_200ExtraLight,
		Lexend_300Light,
		Lexend_400Regular,
		Lexend_500Medium,
		Lexend_600SemiBold,
		Lexend_700Bold,
		Lexend_800ExtraBold,
		Lexend_900Black,
	});

	const initializeAuth = useAuthStore((state) => state.initializeAuth);

	useEffect(() => {
		SystemUI.setBackgroundColorAsync('#FFFFFF');
	});

	useEffect(() => {
		const init = async () => {
			await initializeAuth();
		}
		init();
	}, []);

	useEffect(() => {
		if (fontsLoaded) SplashScreen.hideAsync();
	}, [fontsLoaded]);

	if (!fontsLoaded) return null;

	return (
		<QueryClientProvider client={queryClient}>
			<SafeAreaProvider>
				<StatusBar style="dark" />
				<Stack screenOptions={{ headerShown: false }} />
			</SafeAreaProvider>
		</QueryClientProvider>
	);
}
