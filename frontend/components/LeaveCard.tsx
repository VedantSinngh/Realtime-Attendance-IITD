import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function LeaveCard({ item, onPress }: any) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.card}>
            <Text style={{ fontWeight: "700" }}>{item.type || "Leave"}</Text>
            <Text style={{ color: "#666" }}>{item.forDate} • {item.status}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: { padding: 12, borderRadius: 8, backgroundColor: "#fff", marginBottom: 8, borderWidth: 1, borderColor: "#eee" },
});
