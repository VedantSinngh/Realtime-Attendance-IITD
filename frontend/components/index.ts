import { useEffect, useState } from "react";
import { useAuth } from "../services/AuthContext";
import { router } from "expo-router";
import { View, ActivityIndicator, Text, StyleSheet, Alert } from "react-native";
import SplashScreen from "../components/SplashScreen";

export default function Index() {
    const { role, loading, initialized, error } = useAuth();
    const [showSplash, setShowSplash] = useState(true);
    const [navigationComplete, setNavigationComplete] = useState(false);

    // Handle splash screen completion
    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    // Handle navigation based on auth state
    useEffect(() => {
        if (!showSplash && initialized && !loading && !navigationComplete) {
            setNavigationComplete(true);

            if (error) {
                Alert.alert(
                    "Authentication Error",
                    error.message,
                    [{ text: "OK", onPress: () => router.replace("/onboarding/signin") }]
                );
                return;
            }

            // Navigate based on role
            if (role === "admin") {
                router.replace("/admin");
            } else if (role === "user") {
                router.replace("/home");
            } else {
                router.replace("/onboarding");
            }
        }
    }, [role, loading, initialized, showSplash, error, navigationComplete]);

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen onFinish={ handleSplashFinish } />;
    }

    // Show loading after splash while auth is initializing
    if (!initialized || loading) {
        return (
            <View style= { styles.loadingContainer } >
            <ActivityIndicator size="large" color = "#667eea" />
                <Text style={ styles.loadingText }>
                    {!initialized ? "Initializing..." : "Loading..."
    }
    </Text>
        </View>
        );
}

// Show error state if there's an auth error
if (error) {
    return (
        <View style= { styles.errorContainer } >
        <Text style={ styles.errorTitle }> Something went wrong </Text>
            < Text style = { styles.errorText } > { error.message } </Text>
                < ActivityIndicator size = "small" color = "#ff6b6b" style = {{ marginTop: 20 }
} />
    </View>
        );
    }

// This should rarely be seen as navigation should happen in useEffect
return (
    <View style= { styles.loadingContainer } >
    <ActivityIndicator size="large" color = "#667eea" />
        <Text style={ styles.loadingText }> Redirecting...</Text>
            </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9ff',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#667eea',
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff5f5',
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#e53e3e',
        marginBottom: 10,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#718096',
        textAlign: 'center',
        lineHeight: 24,
    },
});