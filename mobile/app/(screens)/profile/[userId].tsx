import StyledText from "@/components/ui/StyledText";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
    const { userId } = useLocalSearchParams();

    return (
        <SafeAreaView>
            <StyledText>
                Profile Screen
            </StyledText>
        </SafeAreaView>
    )
}