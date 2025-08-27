import { View, Text, StyleSheet } from "react-native";

export default function LeaveInfoCard({ appliedOn, appliedFor, type, status }: any) {
    return (
        <View style={styles.card}>
            <Text>Applied On: {appliedOn}</Text>
            <Text>Applied For: {appliedFor}</Text>
            <Text>Type: {type}</Text>
            <Text>Status: {status}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 15,
        backgroundColor: "#f5f5f5",
        borderRadius: 10,
        marginVertical: 5,
    },
});
