import React from "react";
import { TextInput, StyleSheet, TextInputProps } from "react-native";

export default function Input(props: TextInputProps) {
    return <TextInput style={styles.input} placeholderTextColor="#999" {...props} />;
}

const styles = StyleSheet.create({
    input: { height: 48, borderWidth: 1, borderColor: "#e6e6e6", borderRadius: 8, paddingHorizontal: 12 },
});
