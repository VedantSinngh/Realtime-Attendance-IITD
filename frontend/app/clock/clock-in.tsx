import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

// Simulated face verification component
const FaceRegistration = ({ onSuccess }) => {
    React.useEffect(() => {
        // Simulate face scanning process
        const timer = setTimeout(() => {
            onSuccess();
        }, 2000); // Simulate 2 seconds scanning time

        return () => clearTimeout(timer);
    }, [onSuccess]);

    return (
        <View style={styles.scanningContainer}>
            <Text>Scanning face...</Text>
            <Text style={styles.scanningText}>✓ Face detected</Text>
            <Text style={styles.scanningText}>✓ Verifying identity</Text>
        </View>
    );
};

export default function ClockIn() {
    const router = useRouter();
    const [isScanning, setIsScanning] = React.useState(false);
    const [currentTime, setCurrentTime] = React.useState(new Date());

    // Update time every second
    React.useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleFaceVerificationSuccess = () => {
        console.log("Face verification successful ✅");
        router.push("/clock/clock-in-confirm");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Face Verification — Clock In</Text>

            <View style={styles.cameraBox}>
                {isScanning ? (
                    <FaceRegistration onSuccess={handleFaceVerificationSuccess} />
                ) : (
                    <Text>Camera preview placeholder</Text>
                )}
            </View>

            {!isScanning && (
                <Button
                    title="Start Face Scan"
                    onPress={() => setIsScanning(true)}
                    style={styles.button}
                />
            )}

            <Text style={styles.timestamp}>
                {currentTime.toLocaleTimeString()}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff"
    },
    title: {
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 20,
        textAlign: "center"
    },
    cameraBox: {
        marginVertical: 20,
        height: 260,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center"
    },
    timestamp: {
        marginTop: 16,
        fontSize: 16,
        textAlign: "center",
        fontWeight: "600"
    },
    button: {
        marginTop: 20
    },
    scanningContainer: {
        alignItems: "center",
        justifyContent: "center",
        padding: 20
    },
    scanningText: {
        marginTop: 8,
        color: "green"
    }
});