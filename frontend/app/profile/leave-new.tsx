import React from "react";
import { View, Text } from "react-native";

export default function LeaveNew() {
    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>Apply New Leave</Text>
            <Text style={{ marginTop: 8 }}>Form placeholder (type, dates, team, subject, description).</Text>
        </View>
    );
}
