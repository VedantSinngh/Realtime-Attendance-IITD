import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../../services/supabase"; // Make sure the path is correct
import { useEffect, useState } from "react";
import { router } from "expo-router";

export default function EditProfileScreen() {
    const [userData, setUserData] = useState < any > ({
        full_name: "",
        role: "",
        department: "",
        phone: "",
        location: "",
    });
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserData({
                full_name: user.user_metadata?.full_name || "",
                role: user.user_metadata?.role || "",
                department: user.user_metadata?.department || "",
                phone: user.user_metadata?.phone || "",
                location: user.user_metadata?.location || "",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleSave = async () => {
    setLoading(true);
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: {
                full_name: userData.full_name,
                role: userData.role,
                department: userData.department,
                phone: userData.phone,
                location: userData.location,
            },
        });

        if (error) {
            Alert.alert("Error", error.message);
        } else {
            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => router.replace("/profile") }
            ]);
        }
    } catch (err) {
        console.log(err);
        Alert.alert("Error", "Something went wrong!");
    } finally {
        setLoading(false);
    }
};


    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="chevron-back-outline" size={28} color="#007bff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Edit Profile</Text>
                    <View style={{ width: 28 }} />
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.full_name}
                        onChangeText={(text) => setUserData({ ...userData, full_name: text })}
                        placeholder="Enter full name"
                    />

                    <Text style={styles.label}>Role</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.role}
                        onChangeText={(text) => setUserData({ ...userData, role: text })}
                        placeholder="Enter role"
                    />

                    <Text style={styles.label}>Department</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.department}
                        onChangeText={(text) => setUserData({ ...userData, department: text })}
                        placeholder="Enter department"
                    />

                    <Text style={styles.label}>Phone</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.phone}
                        onChangeText={(text) => setUserData({ ...userData, phone: text })}
                        placeholder="Enter phone"
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={userData.location}
                        onChangeText={(text) => setUserData({ ...userData, location: text })}
                        placeholder="Enter location"
                    />

                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: "#f8f9fa" },
    container: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 30, justifyContent: "space-between" },
    headerTitle: { fontSize: 22, fontWeight: "600", color: "#333" },
    form: { marginTop: 10 },
    label: { fontSize: 14, fontWeight: "500", marginBottom: 6, color: "#555" },
    input: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#ddd" },
    saveButton: { backgroundColor: "#007bff", paddingVertical: 14, borderRadius: 8, alignItems: "center", marginTop: 10 },
    saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
