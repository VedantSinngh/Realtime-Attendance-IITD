import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    Alert
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase"; // Make sure the path is correct

export default function ProfileScreen() {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch authenticated user info
    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserData({
                full_name: user.user_metadata?.full_name || "User Name",
                role: user.user_metadata?.role || "Role",
                department: user.user_metadata?.department || "Department",
                email: user.email || "email@example.com",
                phone: user.user_metadata?.phone || "+1 (000) 000-0000",
                location: user.user_metadata?.location || "Location",
                employee_id: user.user_metadata?.employee_id || "EMP000",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const { error } = await supabase.auth.signOut();
                            if (error) {
                                console.log("Logout error:", error.message);
                                Alert.alert("Error", error.message);
                            } else {
                                // Optional: clear local state
                                setUserData(null);
                                // Navigate to login
                                router.push("/login");
                            }
                        } catch (err) {
                            console.log("Unexpected logout error:", err);
                            Alert.alert("Error", "Something went wrong during logout.");
                        }
                    }
                }
            ]
        );
    };


    const handleEditProfile = () => {
        router.push("/profile/edit"); // Navigate to Edit Profile screen
    };

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Loading...</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Profile</Text>
                    <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
                        <Ionicons name="create-outline" size={22} color="#007bff" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>
                                    {userData.full_name.split(" ").map(n => n[0]).join("") || "U"}
                                </Text>
                            </View>
                            <View style={styles.statusIndicator} />
                        </View>

                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{userData.full_name}</Text>
                            <Text style={styles.profileRole}>{userData.role}</Text>
                            <Text style={styles.profileDepartment}>{userData.department}</Text>
                        </View>
                    </View>

                    <View style={styles.profileDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="mail-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>{userData.email}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="call-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>{userData.phone}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>{userData.location}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Ionicons name="briefcase-outline" size={16} color="#666" />
                            <Text style={styles.detailText}>Employee ID: {userData.employee_id}</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.editProfileButton}
                        activeOpacity={0.8}
                        onPress={handleEditProfile}
                    >
                        <Ionicons name="create-outline" size={18} color="#007bff" />
                        <Text style={styles.editProfileText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>

                {/* Quick Actions */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/leave-status")}>
                        <View style={[styles.menuIconContainer, { backgroundColor: "#007bff15" }]}>
                            <Ionicons name="calendar-outline" size={22} color="#007bff" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Leave Status</Text>
                            <Text style={styles.menuSubtitle}>View your leave requests</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/profile/settings")}>
                        <View style={[styles.menuIconContainer, { backgroundColor: "#6c757d15" }]}>
                            <Ionicons name="settings-outline" size={22} color="#6c757d" />
                        </View>
                        <View style={styles.menuContent}>
                            <Text style={styles.menuTitle}>Settings</Text>
                            <Text style={styles.menuSubtitle}>App preferences and configuration</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#ccc" />
                    </TouchableOpacity>
                </View>

                {/* Logout Section */}
                <View style={styles.logoutSection}>
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>

                {/* App Version */}
                <View style={styles.versionContainer}>
                    <Text style={styles.versionText}>Version 1.2.0</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Reuse your existing styles from your original code
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#f8f9fa' },
    container: { flex: 1 },
    contentContainer: { paddingBottom: 30 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e9ecef' },
    title: { fontSize: 24, fontWeight: '700', color: '#333' },
    editButton: { padding: 5 },
    profileCard: { backgroundColor: '#fff', margin: 20, borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
    profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    avatarContainer: { position: 'relative', marginRight: 16 },
    avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center' },
    avatarText: { color: '#fff', fontSize: 24, fontWeight: '600' },
    statusIndicator: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#28a745', borderWidth: 2, borderColor: '#fff' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 4 },
    profileRole: { fontSize: 16, color: '#007bff', fontWeight: '500', marginBottom: 2 },
    profileDepartment: { fontSize: 14, color: '#666' },
    profileDetails: { marginBottom: 20 },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    detailText: { marginLeft: 12, fontSize: 15, color: '#555' },
    editProfileButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderWidth: 1, borderColor: '#007bff', borderRadius: 8 },
    editProfileText: { marginLeft: 6, fontSize: 16, color: '#007bff', fontWeight: '500' },
    menuSection: { paddingHorizontal: 20, marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 15 },
    menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    menuIconContainer: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    menuContent: { flex: 1 },
    menuTitle: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 2 },
    menuSubtitle: { fontSize: 13, color: '#666' },
    logoutSection: { paddingHorizontal: 20, marginTop: 20 },
    logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 12, borderWidth: 1, borderColor: '#dc3545', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    logoutText: { marginLeft: 8, fontSize: 16, color: '#dc3545', fontWeight: '500' },
    versionContainer: { alignItems: 'center', marginTop: 20, paddingHorizontal: 20 },
    versionText: { fontSize: 12, color: '#999' },
});
