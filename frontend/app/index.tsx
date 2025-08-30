import { useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
    const { role, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (role === "admin") {
                router.replace("/admin"); // Redirect to admin dashboard
            } else if (role === "user") {
                router.replace("/home"); // Redirect to normal app
            } else {
                router.replace("/onboarding/signin"); // Not logged in
            }
        }
    }, [role, loading]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return null;
}
