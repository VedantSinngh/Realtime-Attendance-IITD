import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    BackHandler,
    StatusBar,
    SafeAreaView,
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import AttendanceScanner from '../../components/AttendanceScanner';
import ApiService from '../../services/apiService';

export default function PostScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [serverConnected, setServerConnected] = useState(false);

    // Check server on mount
    useEffect(() => {
        checkServerConnection();
    }, []);

    // Android back button
    useEffect(() => {
        const backAction = () => {
            Alert.alert("Exit Scanner", "Are you sure you want to go back?", [
                { text: "Cancel", style: "cancel" },
                { text: "YES", onPress: () => router.back(), style: "destructive" }
            ]);
            return true;
        };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, []);

    const checkServerConnection = async () => {
        try {
            await ApiService.healthCheck();
            setServerConnected(true);
        } catch (error) {
            console.error('Server connection failed:', error);
            setServerConnected(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        Alert.alert("Exit Scanner", "Stop scanning and go back?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Yes, Go Back",
                onPress: async () => {
                    try {
                        await ApiService.stopScanner();
                    } catch (error) {
                        console.log('Scanner stop error (ignored):', error.message);
                    }
                    router.back();
                },
                style: "destructive"
            }
        ]);
    };

    const CustomButton = ({ title, onPress, variant = 'primary', style = {} }) => (
        <TouchableOpacity
            style={[
                styles.button,
                variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
                style
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.buttonText,
                variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
                <View style={styles.gradientBackground}>
                    <View style={styles.loadingContainer}>
                        <View style={styles.loadingCard}>
                            <ActivityIndicator size="large" color="#3b82f6" />
                            <Text style={styles.loadingText}>Connecting to Server...</Text>
                        </View>
                        <CustomButton 
                            title="Go Home" 
                            onPress={() => router.push('/home')}
                            variant="secondary"
                            style={styles.homeButton}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    if (!serverConnected) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
                <View style={styles.gradientBackground}>
                    <View style={styles.errorContainer}>
                        <View style={styles.errorCard}>
                            <Text style={styles.errorTitle}>Connection Failed</Text>
                            <CustomButton title="Retry" onPress={checkServerConnection} style={styles.retryButton} />
                        </View>
                        <CustomButton 
                            title="Go Home" 
                            onPress={() => router.push('/home')}
                            variant="secondary"
                            style={styles.homeButton}
                        />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
            <View style={styles.gradientBackground}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Attendance Scanner</Text>
                    <View style={styles.placeholder} />
                </View>

                {/* Scanner */}
                <View style={styles.scannerContainer}>
                    <View style={styles.scannerWrapper}>
                        <AttendanceScanner
                            onBack={handleBack}
                            onError={(error) => {
                                Alert.alert('Scanner Error', error.message);
                            }}
                        />
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.bottomContainer}>
                    <CustomButton 
                        title="🏠 Go Home" 
                        onPress={() => router.push('/home')}
                        variant="secondary"
                        style={styles.homeButtonBottom}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e3a8a' },
    gradientBackground: { flex: 1, backgroundColor: '#1e40af' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    backButtonText: { fontSize: 20, color: '#93c5fd', fontWeight: 'bold' },
    headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
    placeholder: { width: 40 },
    scannerContainer: { flex: 1, padding: 20 },
    scannerWrapper: { flex: 1, borderRadius: 20, overflow: 'hidden', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
    bottomContainer: { padding: 20 },
    button: { borderRadius: 12, paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
    primaryButton: { backgroundColor: '#3b82f6' },
    secondaryButton: { backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 2, borderColor: 'rgba(59,130,246,0.3)' },
    buttonText: { fontSize: 16, fontWeight: '600' },
    primaryButtonText: { color: '#fff' },
    secondaryButtonText: { color: '#1e40af' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12, alignItems: 'center' },
    errorTitle: { fontSize: 20, color: '#dc2626', fontWeight: '700' },
    retryButton: { marginTop: 10 },
    homeButton: { marginTop: 20 },
    homeButtonBottom: { width: '100%' }
});
