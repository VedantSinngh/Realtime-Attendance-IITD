import React from "react";
import { View, StyleSheet } from "react-native";
import { router } from "expo-router";
import FaceRegistration from "../../components/FaceRegistration";

export default function PreScreen() {
    // must be a function
    const handleSuccess = () => {
        console.log("Navigating back after success ✅");
        router.back();
    };

    return (
        <View style={styles.container}>
            {/* Pass the function as a prop */}
            <FaceRegistration onSuccess={handleSuccess} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});
