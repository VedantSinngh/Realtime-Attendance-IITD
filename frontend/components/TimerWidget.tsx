import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TimerWidget() {
    return (
        <View style={styles.box}>
            <Text style={{ fontWeight: "700" }}>Today — Aug 12</Text>
            <Text style={{ marginTop: 6 }}>Working: 03:45 hrs</Text>
            <Text>Break: 00:30 hrs</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    box: { padding: 12, backgroundColor: "#f9f9f9", borderRadius: 8, marginTop: 12 },
});
