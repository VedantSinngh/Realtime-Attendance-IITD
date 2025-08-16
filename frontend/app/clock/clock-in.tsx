import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function ClockIn() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Face Verification — Clock In</Text>
            <View style={styles.cameraBox}><Text>Camera scanning placeholder</Text></View>
            <Button title="Simulate Scan Success" onPress={() => router.push("/clock/clock-in-confirm")} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 20, fontWeight: "700" },
    cameraBox: { marginTop: 20, height: 260, borderWidth: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
