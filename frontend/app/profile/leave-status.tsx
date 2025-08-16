import React from "react";
import { View, Text, FlatList } from "react-native";
import LeaveCard from "../../components/LeaveCard";
import { useRouter } from "expo-router";

const DUMMY = [{ id: "L1", appliedOn: "2025-07-01", forDate: "2025-07-05", type: "Casual", status: "Pending" }];

export default function LeaveStatus() {
    const router = useRouter();
    return (
        <View style={{ flex: 1, padding: 12 }}>
            <FlatList data={DUMMY} keyExtractor={(i) => i.id} renderItem={({ item }) => <LeaveCard item={item} onPress={() => router.push("/profile/leave-info")} />} />
        </View>
    );
}
