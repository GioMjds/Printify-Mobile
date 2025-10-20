import useAuthStore from "@/stores/AuthStore";
import { Stack, Redirect } from "expo-router";

export default function ScreensLayout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/login" />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
}