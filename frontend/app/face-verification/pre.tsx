import React from "react";
import { View, StyleSheet, SafeAreaView, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import FaceRegistration from "../../components/FaceRegistration";

export default function PreScreen() {
    const handleSuccess = () => {
        console.log("Navigating back after success ✅");
        router.back();
    };

    const handlePostRedirect = () => {
        router.push('/face-verification/post');
    };

    const handleBack = () => {
        router.back();
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={handleBack}
                >
                    <Ionicons name="chevron-back" size={24} color="#2196F3" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>Face Registration</Text>
                    <Text style={styles.subtitle}>Set up your face authentication</Text>
                </View>
                <View style={styles.headerRight} />
            </View>

            {/* Main Content */}
            <View style={styles.container}>
                {/* Face Registration Component */}
                <View style={styles.registrationContainer}>
                    <FaceRegistration onSuccess={handleSuccess} />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionContainer}>
                    <TouchableOpacity 
                        style={styles.secondaryButton}
                        onPress={handlePostRedirect}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="arrow-forward-circle-outline" size={20} color="#2196F3" />
                        <Text style={styles.secondaryButtonText}>Go to Post Verification</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E3F2FD',
        elevation: 2,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContent: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1976D2',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
        textAlign: 'center',
    },
    headerRight: {
        width: 40,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    registrationContainer: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginTop: 20,
        padding: 20,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E3F2FD',
    },
    actionContainer: {
        paddingVertical: 20,
        gap: 12,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#2196F3',
        gap: 8,
        shadowColor: '#2196F3',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    secondaryButtonText: {
        color: '#2196F3',
        fontSize: 16,
        fontWeight: '600',
    },
});