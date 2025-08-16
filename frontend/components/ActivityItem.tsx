import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ActivityItem({ item }: any) {
    return (
        <View style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{item.info}</Text>
            <Text style={{ color: "#555" }}>{item.time} • {item.location}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: { padding: 12, borderRadius: 8, backgroundColor: "#fff", marginBottom: 10, elevation: 1 },
});
