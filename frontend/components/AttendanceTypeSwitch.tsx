import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function AttendanceTypeSwitch() {
    return (
        <View style={styles.row}>
            <TouchableOpacity style={[styles.btn, styles.active]}>
                <Text style={{ color: "#fff" }}>Individual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn]}>
                <Text>Group</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row", marginTop: 12 },
    btn: { flex: 1, padding: 10, alignItems: "center", borderRadius: 8, borderWidth: 1, borderColor: "#ddd", marginHorizontal: 4 },
    active: { backgroundColor: "#1E90FF", borderColor: "#1E90FF" },
});
