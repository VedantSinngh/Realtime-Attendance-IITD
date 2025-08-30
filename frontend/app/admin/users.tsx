import { View, Text, Button } from "react-native";
import { useAuth } from "../../services/AuthContext";

export default function ManageUsers() {
    const { signOut } = useAuth();

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>Manage Users Page</Text>
            <Button title="Logout" onPress={signOut} />
        </View>
    );
}
