import StyledText from "@/components/ui/StyledText";
import { useLocalSearchParams, useRouter } from "expo-router";
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { upload } from "@/gateway/Upload";
import { Ionicons } from "@expo/vector-icons";

export default function UploadIDScreen() {
    const { uploadId } = useLocalSearchParams();
    const router = useRouter();

    const { data: uploadData, isLoading, error } = useQuery({
        queryKey: ['upload', uploadId],
        queryFn: () => upload.getUploadById(uploadId as string),
        enabled: !!uploadId,
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

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'time-outline';
            case 'approved':
                return 'checkmark-circle-outline';
            case 'rejected':
                return 'close-circle-outline';
            case 'cancelled':
                return 'ban-outline';
            default:
                return 'document-outline';
        }
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#483aa0" />
                    <StyledText variant="lexend" className="text-gray-600 mt-4">
                        Loading upload details...
                    </StyledText>
                </View>
            </SafeAreaView>
        );
    }

    if (error || !uploadData) {
        return (
            <SafeAreaView className="flex-1 bg-background">
                <View className="flex-1 items-center justify-center px-6">
                    <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                    <StyledText variant="lexend-semibold" className="text-2xl text-red-600 mt-4 mb-2">
                        Upload Not Found
                    </StyledText>
                    <StyledText variant="lexend" className="text-gray-600 text-center mb-6">
                        This upload doesn't exist or you don't have access to it.
                    </StyledText>
                    <TouchableOpacity
                        className="px-6 py-3 bg-primary rounded-lg"
                        onPress={() => router.back()}
                    >
                        <StyledText variant="lexend-semibold" className="text-white">
                            Go Back
                        </StyledText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-200 flex-row items-center">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-3 p-2 -ml-2"
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#0e2148" />
                </TouchableOpacity>
                <StyledText variant="lexend-bold" className="text-2xl text-primary flex-1">
                    Upload Details
                </StyledText>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    {/* Status Card */}
                    <View className={`p-6 rounded-2xl border-2 ${getStatusColor(uploadData.status)} mb-6`}>
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className={`p-3 rounded-full ${getStatusColor(uploadData.status)}`}>
                                    <Ionicons 
                                        name={getStatusIcon(uploadData.status) as any} 
                                        size={32} 
                                        color={getStatusTextColor(uploadData.status).replace('text-', '#')} 
                                    />
                                </View>
                                <View className="ml-4">
                                    <StyledText variant="lexend" className="text-xs text-gray-600 uppercase mb-1">
                                        Status
                                    </StyledText>
                                    <StyledText variant="lexend-bold" className={`text-2xl ${getStatusTextColor(uploadData.status)} capitalize`}>
                                        {uploadData.status}
                                    </StyledText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* File Information Card */}
                    <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-200">
                        <StyledText variant="lexend-bold" className="text-xl text-primary mb-4">
                            File Information
                        </StyledText>

                        <View className="space-y-4">
                            <View className="flex-row items-start pb-3 border-b border-gray-100">
                                <Ionicons name="document-text-outline" size={20} color="#6b7280" />
                                <View className="ml-3 flex-1">
                                    <StyledText variant="lexend" className="text-xs text-gray-500 mb-1">
                                        Filename
                                    </StyledText>
                                    <StyledText variant="lexend-medium" className="text-base text-gray-900">
                                        {uploadData.filename}
                                    </StyledText>
                                </View>
                            </View>

                            <View className="flex-row items-start pb-3 border-b border-gray-100">
                                <Ionicons name="copy-outline" size={20} color="#6b7280" />
                                <View className="ml-3 flex-1">
                                    <StyledText variant="lexend" className="text-xs text-gray-500 mb-1">
                                        Format
                                    </StyledText>
                                    <StyledText variant="lexend-medium" className="text-base text-gray-900 uppercase">
                                        {uploadData.format}
                                    </StyledText>
                                </View>
                            </View>

                            <View className="flex-row items-start pb-3 border-b border-gray-100">
                                <Ionicons name="calendar-outline" size={20} color="#6b7280" />
                                <View className="ml-3 flex-1">
                                    <StyledText variant="lexend" className="text-xs text-gray-500 mb-1">
                                        Uploaded At
                                    </StyledText>
                                    <StyledText variant="lexend-medium" className="text-base text-gray-900">
                                        {formatDate(uploadData.createdAt)}
                                    </StyledText>
                                </View>
                            </View>

                            <View className="flex-row items-start">
                                <Ionicons name="refresh-outline" size={20} color="#6b7280" />
                                <View className="ml-3 flex-1">
                                    <StyledText variant="lexend" className="text-xs text-gray-500 mb-1">
                                        Last Updated
                                    </StyledText>
                                    <StyledText variant="lexend-medium" className="text-base text-gray-900">
                                        {formatDate(uploadData.updatedAt)}
                                    </StyledText>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Amount Card (if exists) */}
                    {uploadData.needed_amount && (
                        <View className="bg-secondary rounded-2xl p-6 mb-6">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="cash-outline" size={24} color="#ffffff" />
                                <StyledText variant="lexend-semibold" className="text-white ml-2">
                                    Amount Needed
                                </StyledText>
                            </View>
                            <StyledText variant="lexend-bold" className="text-4xl text-white mt-2">
                                ${uploadData.needed_amount.toFixed(2)}
                            </StyledText>
                        </View>
                    )}

                    {/* Rejection Reason Card */}
                    {uploadData.rejection_reason && (
                        <View className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="close-circle" size={24} color="#dc2626" />
                                <StyledText variant="lexend-bold" className="text-red-700 ml-2 text-lg">
                                    Rejection Reason
                                </StyledText>
                            </View>
                            <StyledText variant="lexend" className="text-red-800 leading-6">
                                {uploadData.rejection_reason}
                            </StyledText>
                        </View>
                    )}

                    {/* Cancellation Reason Card */}
                    {uploadData.cancel_reason && (
                        <View className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 mb-6">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="ban" size={24} color="#6b7280" />
                                <StyledText variant="lexend-bold" className="text-gray-700 ml-2 text-lg">
                                    Cancellation Reason
                                </StyledText>
                            </View>
                            <StyledText variant="lexend" className="text-gray-800 leading-6">
                                {uploadData.cancel_reason}
                            </StyledText>
                        </View>
                    )}

                    {/* ID Card */}
                    <View className="bg-gray-50 rounded-2xl p-6">
                        <StyledText variant="lexend" className="text-xs text-gray-500 mb-2">
                            Upload ID
                        </StyledText>
                        <StyledText variant="lexend-medium" className="text-sm text-gray-700">
                            {uploadData.id}
                        </StyledText>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}