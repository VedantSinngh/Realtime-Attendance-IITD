import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
    const handleGetStarted = () => {
        router.push('/onboarding/signin');
    };

    return (
        <>
            <StatusBar style="light" />
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.content}>
                        {/* Logo/Icon */}
                        <View style={styles.logoContainer}>
                            <View style={styles.logo}>
                                <Text style={styles.logoText}>A</Text>
                            </View>
                        </View>

                        {/* Welcome Text */}
                        <View style={styles.textContainer}>
                            <Text style={styles.title}>Welcome to Your App</Text>
                            <Text style={styles.subtitle}>
                                Manage your time, track your progress, and stay organized with our comprehensive solution.
                            </Text>
                        </View>

                        {/* Features */}
                        <View style={styles.featuresContainer}>
                            <View style={styles.feature}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureIconText}>⏰</Text>
                                </View>
                                <Text style={styles.featureText}>Time Tracking</Text>
                            </View>

                            <View style={styles.feature}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureIconText}>👤</Text>
                                </View>
                                <Text style={styles.featureText}>Face Verification</Text>
                            </View>

                            <View style={styles.feature}>
                                <View style={styles.featureIcon}>
                                    <Text style={styles.featureIconText}>📊</Text>
                                </View>
                                <Text style={styles.featureText}>Analytics</Text>
                            </View>
                        </View>

                        {/* CTA Button */}
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleGetStarted}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Get Started</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 24,
    },
    featuresContainer: {
        paddingVertical: 20,
    },
    feature: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        padding: 16,
        borderRadius: 12,
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureIconText: {
        fontSize: 20,
    },
    featureText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    button: {
        backgroundColor: '#ffffff',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 25,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#667eea',
    },
});