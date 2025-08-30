import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ScrollView } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import { supabase } from "../../services/supabase";

export default function SignIn() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }
        
        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        if (!password.trim()) {
            Alert.alert("Error", "Please enter your password");
            return;
        }

        if (password.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters");
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                // Sign up new user
                const { data, error } = await supabase.auth.signUp({
                    email: email.toLowerCase().trim(),
                    password: password.trim(),
                    options: {
                        data: {
                            sign_up_method: "email_password"
                        }
                    }
                });
                
                if (error) {
                    throw error;
                }
                
                if (data.user?.identities?.length === 0) {
                    Alert.alert("Error", "User already exists. Please sign in instead.");
                    setIsSignUp(false);
                    return;
                }
                
                Alert.alert(
                    "Success", 
                    "Account created successfully! You can now sign in.",
                    [
                        {
                            text: "OK",
                            onPress: () => setIsSignUp(false)
                        }
                    ]
                );
                return;
            } else {
                // Sign in existing user
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.toLowerCase().trim(),
                    password: password.trim(),
                });
                
                if (error) {
                    if (error.message.includes("Invalid login credentials")) {
                        Alert.alert(
                            "User Not Found", 
                            "No account found with this email. Would you like to create one?",
                            [
                                { text: "Cancel", style: "cancel" },
                                { 
                                    text: "Sign Up", 
                                    onPress: () => setIsSignUp(true)
                                }
                            ]
                        );
                        return;
                    }
                    throw error;
                }
                
                // Success - user is signed in
                console.log("User signed in:", data.user.email);
                router.replace("/face-verification/pre");
            }
        } catch (error: any) {
            console.error("Authentication error:", error);
            Alert.alert("Authentication Error", error.message || "An error occurred during authentication");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address first");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                email.toLowerCase().trim()
            );
            
            if (error) throw error;
            
            Alert.alert(
                "Password Reset", 
                "Check your email for password reset instructions"
            );
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>
                    {isSignUp ? "Create Account" : "Welcome Back"}
                </Text>
                <Text style={styles.subtitle}>
                    {isSignUp 
                        ? "Create a new account to get started" 
                        : "Sign in to continue to your account"
                    }
                </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email Address</Text>
                        <Input
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            value={email}
                            onChangeText={setEmail}
                            style={styles.input}
                            autoCapitalize="none"
                            autoComplete="email"
                        />
                    </View>
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Password</Text>
                        <Input
                            placeholder={isSignUp ? "Create a password (min 6 chars)" : "Enter your password"}
                            secureTextEntry={true}
                            value={password}
                            onChangeText={setPassword}
                            style={styles.input}
                            autoComplete="password"
                        />
                    </View>
                </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                <Button
                    title={
                        loading 
                            ? "Processing..." 
                            : isSignUp 
                                ? "Create Account" 
                                : "Sign In"
                    }
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.primaryButton}
                />

                {/* Secondary Actions */}
                <View style={styles.secondaryActions}>
                    {!isSignUp && (
                        <Button
                            variant="ghost"
                            title="Forgot Password?"
                            onPress={handleForgotPassword}
                            style={styles.secondaryButton}
                        />
                    )}
                    
                    <Button
                        variant="ghost"
                        title={isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                        onPress={() => setIsSignUp(!isSignUp)}
                        style={styles.secondaryButton}
                    />
                </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    contentContainer: {
        padding: 20,
        minHeight: '100%',
    },
    header: {
        marginTop: 40,
        marginBottom: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
    },
    formContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        marginBottom: 24,
    },
    inputContainer: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 4,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    buttonContainer: {
        gap: 16,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: '#3b82f6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    secondaryActions: {
        gap: 8,
    },
    secondaryButton: {
        paddingVertical: 12,
    },
    footer: {
        marginTop: 'auto',
        paddingTop: 32,
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 18,
    },
});