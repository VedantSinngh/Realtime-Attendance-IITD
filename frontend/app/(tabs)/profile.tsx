import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function Profile() {
    const router = useRouter();
    
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Profile Header */}
            <View style={styles.header}>
                <View style={styles.profilePicture}>
                    <Text style={styles.profileInitials}>VS</Text>
                </View>
                <Text style={styles.title}>Vedant Singh</Text>
                <Text style={styles.sub}>Computer Science — SRMIST</Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>92%</Text>
                    <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>15</Text>
                    <Text style={styles.statLabel}>Present Days</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>2</Text>
                    <Text style={styles.statLabel}>Leave Days</Text>
                </View>
            </View>

            {/* Main Actions */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Account</Text>
                
                <Button 
                    title="Edit Profile" 
                    onPress={() => router.push("/profile/leave-edit")} 
                />
                <View style={styles.buttonSpacing} />
                
                <Button 
                    title="Profile Information" 
                    onPress={() => router.push("/profile/leave-info")} 
                />
                <View style={styles.buttonSpacing} />
                
                <Button 
                    title="Settings" 
                    onPress={() => router.push("/profile/settings")} 
                />
                <View style={styles.buttonSpacing} />
            </View>

            {/* Leave Management */}
            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Leave Management</Text>
                
                <Button 
                    title="Apply for New Leave" 
                    onPress={() => router.push("/profile/leave-new")} 
                />
                <View style={styles.buttonSpacing} />
                
                <Button 
                    title="Leave Status & History" 
                    onPress={() => router.push("/profile/leave-status")} 
                />
                <View style={styles.buttonSpacing} />
            </View>

            {/* Account Actions */}
            <View style={styles.actionsContainer}>
                <Button 
                    variant="ghost" 
                    title="Log Out" 
                    onPress={() => router.replace("/onboarding/index")} 
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        backgroundColor: '#f8f9fa' 
    },
    header: {
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 24,
        backgroundColor: 'white',
        marginBottom: 16,
    },
    profilePicture: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    profileInitials: {
        fontSize: 28,
        fontWeight: '700',
        color: 'white',
    },
    title: { 
        fontSize: 24, 
        fontWeight: "700",
        marginBottom: 4,
    },
    sub: { 
        color: "#666", 
        fontSize: 16,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        paddingVertical: 20,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: '#007AFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: '#E5E5E5',
    },
    actionsContainer: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        color: '#333',
    },
    buttonSpacing: { 
        height: 12 
    },
});