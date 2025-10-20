import useAuthStore from "@/stores/AuthStore";
import { Stack, Redirect } from "expo-router";

export default function AuthLayout() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Redirect href="/(screens)" />;
    }
    return <Stack screenOptions={{ headerShown: false }} />;
}