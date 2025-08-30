import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../Button";
import { useRouter } from "expo-router";

export const AuthScreen: React.FC = () => {
    const router = useRouter();
    
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Attendance</Text>
            <Text style={styles.subtitle}>
                Track time, breaks, and attendance with face verification.
            </Text>

            <View style={styles.buttonContainer}>
                <Button 
                    title="Sign up with Email" 
                    onPress={() => router.push("/onboarding/signin?mode=email")} 
                    style={styles.button}
                />
                <View style={{ height: 12 }} />
                <Button 
                    title="Sign up with Mobile No." 
                    onPress={() => router.push("/onboarding/signin?mode=phone")} 
                    style={styles.button}
                    variant="outline"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: "center",
        backgroundColor: '#f8fafc',
    },
    title: { 
        fontSize: 28, 
        fontWeight: "700", 
        marginBottom: 12,
        textAlign: 'center',
        color: '#1f2937',
    },
    subtitle: { 
        fontSize: 16, 
        color: "#6b7280",
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    buttonContainer: {
        marginTop: 24,
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
    },
});