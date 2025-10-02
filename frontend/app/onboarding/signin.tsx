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

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please enter both email and password");
            return;
        }

        if (!validateEmail(email)) {
            Alert.alert("Error", "Please enter a valid email address");
            return;
        }

        setLoading(true);

        try {
            if (isSignUp) {
                // 🔹 Sign-up logic removed, just redirect
                router.replace("/face-verification/pre");
            } else {
                // 🔹 Login using Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.toLowerCase().trim(),
                    password: password.trim(),
                });

                if (error) throw error;

                const firstLogin = data.user?.user_metadata?.first_login;
                if (firstLogin) {
                    router.replace("/face-verification/pre");
                } else {
                    router.replace("/face-verification/post");
                }
            }
        } catch (error: any) {
            console.error("Authentication error:", error);
            Alert.alert("Authentication Error", error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!validateEmail(email)) {
            Alert.alert("Error", "Enter a valid email first");
            return;
        }
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim());
            if (error) throw error;
            Alert.alert("Password Reset", "Check your email for reset instructions");
        } catch (error: any) {
            Alert.alert("Error", error.message);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>{isSignUp ? "Create Account" : "Welcome Back"}</Text>
                <Text style={styles.subtitle}>
                    {isSignUp ? "Enter credentials to proceed" : "Sign in to your account"}
                </Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Email</Text>
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
                        placeholder="Enter your password"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        autoComplete="password"
                    />
                </View>
            </View>

            <View style={styles.buttonContainer}>
                <Button
                    title={loading ? "Processing..." : isSignUp ? "Proceed" : "Sign In"}
                    onPress={handleSubmit}
                    disabled={loading}
                    style={styles.primaryButton}
                />
                {!isSignUp && (
                    <Button variant="ghost" title="Forgot Password?" onPress={handleForgotPassword} />
                )}
                <Button
                    variant="ghost"
                    title={isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    onPress={() => setIsSignUp(!isSignUp)}
                />
            </View>

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f8fafc" },
    contentContainer: { padding: 20, minHeight: "100%" },
    header: { marginTop: 40, marginBottom: 32, alignItems: "center" },
    title: { fontSize: 28, fontWeight: "700", color: "#1f2937", marginBottom: 8 },
    subtitle: { fontSize: 16, color: "#6b7280", textAlign: "center" },
    formContainer: {
        backgroundColor: "white",
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        elevation: 3,
    },
    inputGroup: { marginBottom: 16 },
    inputLabel: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
    input: {
        backgroundColor: "#f9fafb",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
    },
    buttonContainer: { gap: 16 },
    primaryButton: { backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 16 },
    footer: { marginTop: "auto", paddingTop: 32, paddingBottom: 20 },
    footerText: { fontSize: 12, color: "#9ca3af", textAlign: "center" },
});
