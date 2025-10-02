import React from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function ClockOut() {
    const router = useRouter();
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleClockOut = async () => {
        try {
            const res = await fetch("http://127.0.0.1:5000/clock-out", { method: "POST" });
            const data = await res.json();
            if (data.status === "success") {
                Alert.alert("Clock Out", `Elapsed Time: ${data.elapsed_time}`);
                router.push("/"); // back to home
            } else {
                Alert.alert("Error", data.message);
            }
        } catch (err) {
            console.error("Error stopping timer:", err);
            Alert.alert("Error", "Unable to connect to server");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Clock Out</Text>
            <Text style={styles.timestamp}>{currentTime.toLocaleTimeString()}</Text>
            <Button title="Clock Out" onPress={handleClockOut} style={styles.button} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff", justifyContent: "center" },
    title: { fontSize: 20, fontWeight: "700", marginBottom: 20, textAlign: "center" },
    timestamp: { marginTop: 16, fontSize: 16, textAlign: "center", fontWeight: "600" },
    button: { marginTop: 40 }
});
