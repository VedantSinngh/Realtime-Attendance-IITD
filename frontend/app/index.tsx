import { useEffect } from "react";
import { useAuth } from "../services/AuthContext";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { supabase } from "../services/supabase";

export default function Index() {
    const { role, loading, user } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (role === "admin") {
                router.replace("/admin");
            } else if (role === "user") {
                const firstLogin = user?.user_metadata?.first_login;
                if (firstLogin) {
                    router.replace("/face-verification/pre");
                } else {
                    router.replace("/face-verification/post");
                }
            } else {
                router.replace("/onboarding/signin");
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
