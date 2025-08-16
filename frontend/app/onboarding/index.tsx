import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function Onboarding() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Attendance</Text>
            <Text style={styles.subtitle}>
                Track time, breaks, and attendance with face verification.
            </Text>

            <View style={{ marginTop: 24 }}>
                <Button title="Sign up with Email" onPress={() => router.push("/onboarding/signin?mode=email")} />
                <View style={{ height: 12 }} />
                <Button title="Sign up with Mobile No." onPress={() => router.push("/onboarding/signin?mode=phone")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: "center" },
    title: { fontSize: 26, fontWeight: "700", marginBottom: 8 },
    subtitle: { fontSize: 14, color: "#666" },
});
