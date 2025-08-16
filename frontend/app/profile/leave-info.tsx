import React from "react";
import { View, Text, Button } from "react-native";

export default function LeaveInfo() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Leave Info</Text>
            <Text style={{ marginTop: 8 }}>Date applied on: 2025-07-01</Text>
            <Text>Date applied for: 2025-07-05</Text>
            <Text>Type: Casual</Text>
            <Text>Status: Pending</Text>
        </View>
    );
}
