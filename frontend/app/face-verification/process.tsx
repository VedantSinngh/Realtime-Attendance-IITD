import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function FaceProcess() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Face Scan</Text>
            <View style={styles.cameraBox}>
                <Text style={{ color: "#888" }}>Camera preview placeholder</Text>
            </View>
            <Text style={styles.instructions}>Center your face inside the square and follow instructions.</Text>
            <View style={{ marginTop: 16 }}>
                <Button title="Simulate Verify" onPress={() => router.push("/face-verification/post")} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    title: { fontSize: 20, fontWeight: "700", marginTop: 6 },
    cameraBox: { height: 300, borderWidth: 2, borderColor: "#ddd", marginTop: 18, alignItems: "center", justifyContent: "center", borderRadius: 8 },
    instructions: { color: "#666", marginTop: 12 },
});
