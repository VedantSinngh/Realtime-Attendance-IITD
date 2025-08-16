import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";

type Props = { title: string; onPress?: () => void; style?: ViewStyle; variant?: "solid" | "ghost" };
export default function Button({ title, onPress, style, variant = "solid" }: Props) {
    const solid = variant === "solid";
    return (
        <TouchableOpacity onPress={onPress} style={[styles.button, solid ? styles.solid : styles.ghost, style]}>
            <Text style={[styles.text, solid ? styles.textSolid : styles.textGhost]}>{title}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, alignItems: "center" },
    solid: { backgroundColor: "#1E90FF" },
    ghost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#ddd" },
    text: { fontSize: 16, fontWeight: "600" },
    textSolid: { color: "#fff" },
    textGhost: { color: "#111" },
});
