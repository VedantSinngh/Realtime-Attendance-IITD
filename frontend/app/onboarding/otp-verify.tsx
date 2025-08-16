import React, { useState } from "react";
import { View, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useRouter } from "expo-router";

export default function OTPVerify() {
    const router = useRouter();
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        if (otp.length < 4) {
            Alert.alert("Invalid OTP", "Please enter a valid 4-digit OTP code");
            return;
        }

        setLoading(true);
        
        try {
            // Simulate API call with timeout
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // On successful verification
            router.replace("/face-verification/pre");
            
        } catch (error) {
            Alert.alert("Error", "Failed to verify OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = () => {
        Alert.alert("OTP Resent", "A new OTP has been sent to your registered number/email");
        setOtp(""); // Clear the OTP input
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>OTP Verification</Text>
            <Text style={styles.subtitle}>Enter the 4-digit code sent to your number/email</Text>
            
            <Input 
                placeholder="Enter OTP" 
                keyboardType="number-pad" 
                value={otp}
                onChangeText={setOtp}
                maxLength={4}
                editable={!loading}
            />
            
            <View style={{ height: 12 }} />
            
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button 
                    title="Verify OTP" 
                    onPress={handleVerify} 
                    disabled={otp.length < 4}
                />
            )}
            
            <View style={{ height: 8 }} />
            <Button 
                variant="ghost" 
                title="Resend OTP" 
                onPress={handleResend} 
                disabled={loading}
            />
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
        marginBottom: 8,
        textAlign: "center"
    },
    subtitle: {
        fontSize: 14,
        color: "#666",
        marginBottom: 20,
        textAlign: "center"
    }
});