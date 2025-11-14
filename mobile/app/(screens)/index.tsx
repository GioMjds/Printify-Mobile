import StyledText from '@/components/ui/StyledText';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { TouchableOpacity, View, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { upload } from '@/gateway/Upload';
import { useQuery } from '@tanstack/react-query';
import { UserUpload } from '@/types/Upload.types';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
    const { logout } = useCustomerAuth();
	const router = useRouter();

	const { data: uploads, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ['uploads'],
		queryFn: () => upload.getUserUploads(),
	});

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return 'bg-yellow-100 border-yellow-400';
			case 'approved':
				return 'bg-green-100 border-green-400';
			case 'rejected':
				return 'bg-red-100 border-red-400';
			case 'cancelled':
				return 'bg-gray-100 border-gray-400';
			default:
				return 'bg-blue-100 border-blue-400';
		}
	};

	const getStatusTextColor = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return 'text-yellow-700';
			case 'approved':
				return 'text-green-700';
			case 'rejected':
				return 'text-red-700';
			case 'cancelled':
				return 'text-gray-700';
			default:
				return 'text-blue-700';
		}
	};

	const formatDate = (date: Date) => {
		return new Date(date).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	const renderUploadItem = ({ item }: { item: UserUpload }) => (
		<TouchableOpacity
			onPress={() => router.push(`/(screens)/upload/${item.id}`)}
			className={`mb-4 p-4 bg-white rounded-xl border-2 ${getStatusColor(item.status)} shadow-sm`}
			activeOpacity={0.7}
		>
			<View className="flex-row justify-between items-start mb-2">
				<View className="flex-1 mr-3">
					<StyledText variant="lexend-semibold" className="text-lg text-primary mb-1" numberOfLines={1}>
						{item.filename}
					</StyledText>
					<StyledText variant="lexend" className="text-xs text-gray-500 uppercase">
						{item.format}
					</StyledText>
				</View>
				<View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
					<StyledText variant="lexend-medium" className={`text-xs ${getStatusTextColor(item.status)}`}>
						{item.status}
					</StyledText>
				</View>
			</View>

			<View className="mt-2 pt-2 border-t border-gray-200">
				<StyledText variant="lexend" className="text-xs text-gray-600">
					Uploaded: {formatDate(item.createdAt)}
				</StyledText>
				
				{item.needed_amount && (
					<StyledText variant="lexend-medium" className="text-sm text-secondary mt-1">
						Amount: ${item.needed_amount}
					</StyledText>
				)}

				{item.rejection_reason && (
					<StyledText variant="lexend" className="text-xs text-red-600 mt-1">
						Rejection: {item.rejection_reason}
					</StyledText>
				)}

				{item.cancel_reason && (
					<StyledText variant="lexend" className="text-xs text-gray-600 mt-1">
						Cancelled: {item.cancel_reason}
					</StyledText>
				)}
			</View>
		</TouchableOpacity>
	);

	const renderEmptyState = () => (
		<View className="flex-1 items-center justify-center py-20">
			<StyledText variant="lexend-medium" className="text-2xl text-gray-400 mb-2">
				No Uploads Yet
			</StyledText>
			<StyledText variant="lexend" className="text-sm text-gray-500 text-center px-8">
				Your uploaded files will appear here
			</StyledText>
		</View>
	);

	return (
		<SafeAreaView className="flex-1 bg-background">
			{/* Header */}
			<View className="px-6 py-4 bg-white border-b border-gray-200">
				<View className="flex-row justify-between items-center">
					<View>
						<StyledText variant="lexend-bold" className="text-3xl text-primary">
							My Uploads
						</StyledText>
						{uploads && uploads.length > 0 && (
							<StyledText variant="lexend" className="text-sm text-gray-600 mt-1">
								{uploads.length} {uploads.length === 1 ? 'file' : 'files'} uploaded
							</StyledText>
						)}
					</View>
					<TouchableOpacity 
						className="px-4 py-2 bg-red-500 rounded-lg shadow-sm"
						onPress={() => logout()}
						activeOpacity={0.8}
					>
						<StyledText variant="lexend-semibold" className="text-white">
							Log Out
						</StyledText>
					</TouchableOpacity>
				</View>
			</View>

			{/* Content */}
			{isLoading ? (
				<View className="flex-1 items-center justify-center">
					<ActivityIndicator size="large" color="#483aa0" />
					<StyledText variant="lexend" className="text-gray-600 mt-4">
						Loading uploads...
					</StyledText>
				</View>
			) : (
				<FlatList
					data={uploads}
					renderItem={renderUploadItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 24, flexGrow: 1 }}
					ListEmptyComponent={renderEmptyState}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							colors={['#483aa0']}
							tintColor="#483aa0"
						/>
					}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</SafeAreaView>
	);
}
