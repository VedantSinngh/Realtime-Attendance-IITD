import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Alert,
    BackHandler,
    StatusBar,
    SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import AttendanceScanner from '../../components/AttendanceScanner';
import ApiService from '../../services/apiService';

export default function PostScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [serverConnected, setServerConnected] = useState(false);

    // Check server connection on mount
    useEffect(() => {
        checkServerConnection();
    }, []);

    // Handle hardware back button on Android
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                "Exit Scanner",
                "Are you sure you want to go back?",
                [
                    {
                        text: "Cancel",
                        onPress: () => null,
                        style: "cancel"
                    },
                    {
                        text: "YES",
                        onPress: () => router.back()
                    }
                ]
            );
            return true; // Prevent default behavior
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);

    const checkServerConnection = async () => {
        try {
            setIsLoading(true);
            await ApiService.healthCheck();
            setServerConnected(true);
        } catch (error) {
            console.error('Server connection failed:', error);
            setServerConnected(false);
            Alert.alert(
                'Connection Error',
                'Cannot connect to the attendance server. Please check if the server is running.',
                [
                    {
                        text: 'Retry',
                        onPress: checkServerConnection
                    },
                    {
                        text: 'Go Back',
                        onPress: () => router.back()
                    }
                ]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        Alert.alert(
            "Exit Scanner",
            "Are you sure you want to go back? This will stop any active scanning.",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Yes, Go Back",
                    onPress: async () => {
                        try {
                            // Try to stop scanner if it's running
                            await ApiService.stopScanner();
                        } catch (error) {
                            // Ignore error if scanner wasn't running
                            console.log('Scanner stop error (ignored):', error.message);
                        }
                        router.back();
                    }
                }
            ]
        );
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
                <View style={styles.loadingContainer}>
                    {/* You can add a loading spinner here */}
                </View>
            </SafeAreaView>
        );
    }

    if (!serverConnected) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
                <View style={styles.errorContainer}>
                    {/* Error state - could add retry button or error message */}
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
            <View style={styles.scannerContainer}>
                <AttendanceScanner
                    onBack={handleBack}
                    onError={(error) => {
                        Alert.alert('Scanner Error', error.message);
                    }}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scannerContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
});