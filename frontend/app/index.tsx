import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function Splash() {
    const router = useRouter();

    useEffect(() => {
        const t = setTimeout(() => {
            router.replace("/onboarding/signin");
        }, 1200);
        return () => clearTimeout(t);
    }, []);

    return (
        <View style={styles.container}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
    logo: { width: 160, height: 160, resizeMode: "contain" },
});
