import React from "react";
import { View, StyleSheet, Button } from "react-native";
import { router } from "expo-router";
import FaceRegistration from "../../components/FaceRegistration";

export default function PreScreen() {
    // must be a function
    const handleSuccess = () => {
        console.log("Navigating back after success ✅");
        router.back();
    };

    const handlePostRedirect = () => {
        router.push('/face-verification/post');
    };

    return (
        <View style={styles.container}>
            {/* Pass the function as a prop */}
            <FaceRegistration onSuccess={handleSuccess} />
            <Button 
                title="Go to Post Verification"
                onPress={handlePostRedirect}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
});
