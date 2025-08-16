import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SignIn() {
    const router = useRouter();
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");

    const activeMode = mode || "phone";

    const handleSubmit = () => {
        if (activeMode === "email") {
            // Handle email/password login
            console.log("Email login:", { email, password });
            router.push("/onboarding/otp-verify");
        } else {
            // Handle phone OTP login
            console.log("Phone login:", phone);
            router.push("/onboarding/otp-verify");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign in</Text>
            
            {/* Mode selector */}
            <View style={styles.modeSelector}>
                <Button 
                    variant={activeMode === "phone" ? "primary" : "ghost"} 
                    title="Phone" 
                    onPress={() => router.setParams({ mode: "phone" })}
                    style={styles.modeButton}
                />
                <Button 
                    variant={activeMode === "email" ? "primary" : "ghost"} 
                    title="Email" 
                    onPress={() => router.setParams({ mode: "email" })}
                    style={styles.modeButton}
                />
            </View>

            {/* Phone input */}
            {activeMode === "phone" && (
                <Input 
                    placeholder="Phone number"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                    style={styles.input}
                />
            )}

            {/* Email input */}
            {activeMode === "email" && (
                <>
                    <Input 
                        placeholder="Email address"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        autoCapitalize="none"
                    />
                    <Input 
                        placeholder="Password"
                        secureTextEntry={true}
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                    />
                </>
            )}

            <View style={{ height: 12 }} />
            <Button 
                title={activeMode === "phone" ? "Send OTP" : "Sign In"} 
                onPress={handleSubmit} 
            />
            
            <View style={{ height: 8 }} />
            <Button 
                variant="ghost" 
                title="Use ID instead" 
                onPress={() => alert("Switch to ID (not implemented)")} 
            />
            
            {activeMode === "email" && (
                <Button 
                    variant="ghost" 
                    title="Forgot password?" 
                    onPress={() => router.push("/onboarding/forgot-password")}
                    style={{ marginTop: 8 }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 20, 
        justifyContent: "center" 
    },
    title: { 
        fontSize: 20, 
        fontWeight: "600",
        marginBottom: 20,
        textAlign: "center"
    },
    modeSelector: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 20,
        gap: 10
    },
    modeButton: {
        flex: 1,
    },
    input: {
        marginBottom: 16
    }
});