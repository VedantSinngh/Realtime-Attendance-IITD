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
    Dimensions
} from 'react-native';
import { router } from 'expo-router';
import AttendanceScanner from '../../components/AttendanceScanner';
import ApiService from '../../services/apiService';

const { width, height } = Dimensions.get('window');

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
                        onPress: () => router.back(),
                        style: "destructive"
                    }
                ],
                { 
                    cancelable: true,
                    userInterfaceStyle: 'light'
                }
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
                        onPress: checkServerConnection,
                        style: 'default'
                    },
                    {
                        text: 'Go Back',
                        onPress: () => router.back(),
                        style: 'cancel'
                    }
                ],
                { 
                    cancelable: true,
                    userInterfaceStyle: 'light'
                }
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
                    },
                    style: "destructive"
                }
            ],
            { 
                cancelable: true,
                userInterfaceStyle: 'light'
            }
        );
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
                            <Text style={styles.loadingSubtext}>Please wait while we establish connection</Text>
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
                            <View style={styles.errorIcon}>
                                <Text style={styles.errorIconText}>⚠️</Text>
                            </View>
                            <Text style={styles.errorTitle}>Connection Failed</Text>
                            <Text style={styles.errorMessage}>
                                Unable to connect to the attendance server. Please check your network connection and try again.
                            </Text>
                            <CustomButton 
                                title="Retry Connection" 
                                onPress={checkServerConnection}
                                style={styles.retryButton}
                            />
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

                {/* Scanner Container */}
                <View style={styles.scannerContainer}>
                    <View style={styles.scannerWrapper}>
                        <AttendanceScanner
                            onBack={handleBack}
                            onError={(error) => {
                                Alert.alert(
                                    'Scanner Error', 
                                    error.message,
                                    [{ text: 'OK', style: 'default' }],
                                    { userInterfaceStyle: 'light' }
                                );
                            }}
                        />
                    </View>
                </View>

                {/* Bottom Actions */}
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
    container: {
        flex: 1,
        backgroundColor: '#1e3a8a',
    },
    gradientBackground: {
        flex: 1,
        backgroundColor: '#1e40af', // Fallback color
        // You can add a gradient library like react-native-linear-gradient for better gradients
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(59, 130, 246, 0.3)',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    backButtonText: {
        fontSize: 20,
        color: '#93c5fd',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
    },
    placeholder: {
        width: 40,
    },
    scannerContainer: {
        flex: 1,
        padding: 20,
    },
    scannerWrapper: {
        flex: 1,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.3)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 40,
        alignItems: 'center',
        minWidth: width * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
        marginBottom: 30,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e40af',
        marginTop: 20,
        marginBottom: 8,
    },
    loadingSubtext: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        minWidth: width * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
        marginBottom: 30,
    },
    errorIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fef3c7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    errorIconText: {
        fontSize: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#dc2626',
        marginBottom: 12,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 25,
    },
    bottomContainer: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: 'rgba(30, 58, 138, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(59, 130, 246, 0.3)',
    },
    button: {
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 52,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        borderColor: 'rgba(59, 130, 246, 0.3)',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButtonText: {
        color: '#ffffff',
    },
    secondaryButtonText: {
        color: '#1e40af',
    },
    homeButton: {
        marginTop: 20,
    },
    homeButtonBottom: {
        width: '100%',
    },
    retryButton: {
        width: '100%',
        marginTop: 10,
    },
});