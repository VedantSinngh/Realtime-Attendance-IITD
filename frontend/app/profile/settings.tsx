import React from "react";
import { View, Text } from "react-native";

export default function Settings() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Settings</Text>
            <Text style={{ marginTop: 12 }}>Placeholder for app settings.</Text>
        </View>
    );
}
