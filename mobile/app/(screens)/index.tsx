import StyledText from '@/components/ui/StyledText';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IndexScreen() {
    const { logout } = useCustomerAuth();

    const handleLogout = () => {
        logout();
    }

	return (
		<SafeAreaView className="flex-1 items-center justify-center">
			<StyledText variant="lexend-medium" className="text-4xl">
				Index Screen
			</StyledText>

			<View className='mt-4'>
				<TouchableOpacity 
                    className='px-4 py-2 bg-red-500 rounded-md'
                    onPress={handleLogout}
                >
					<StyledText variant='lexend-semibold'>Log Out</StyledText>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}
