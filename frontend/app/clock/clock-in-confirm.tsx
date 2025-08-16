import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function ClockInConfirm() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Confirm Clock In</Text>
            <Text style={styles.body}>User: Vedant Singh</Text>
            <View style={{ marginTop: 16 }}>
                <Button title="Confirm" onPress={() => router.replace("/(tabs)/home")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "700" },
    body: { marginTop: 8, color: "#444" },
});
