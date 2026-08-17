import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import apiClient from "../api/client";
import { setToken } from "../auth/tokenStorage";
import AuthBackground from "../components/AuthBackground";

function VerifyEmailScreen({ route, onVerifySuccess, navigation }) {
    const { email } = route.params;

    const [code, setCode] = useState("");
    const [codeFocused, setCodeFocused] = useState(false);
    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleVerify = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/verify-email", { email, code });
            const { token, fullName, email: userEmail, theme } = response.data;

            await setToken(token);
            onVerifySuccess({ fullName, email: userEmail, theme });
        } catch (err) {
            setError(err.response?.data?.error || "Verification failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError("");
        setInfo("");
        setResending(true);

        try {
            const response = await apiClient.post("/auth/resend-verification", { email });
            setInfo(response.data.message);
        } catch (err) {
            setError(err.response?.data?.error || "Could not resend code.");
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthBackground>
            <View style={styles.card}>
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                    We sent a 6-digit code to <Text style={styles.bold}>{email}</Text>
                </Text>

                <Text style={[styles.label, styles.centerText]}>Verification Code</Text>
                <TextInput
                    style={[styles.codeInput, codeFocused && styles.inputFocused]}
                    value={code}
                    onChangeText={(text) => setCode(text.replace(/\D/g, "").slice(0, 6))}
                    onFocus={() => setCodeFocused(true)}
                    onBlur={() => setCodeFocused(false)}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                />

                {error ? <Text style={[styles.error, styles.centerText]}>{error}</Text> : null}
                {info ? <Text style={[styles.info, styles.centerText]}>{info}</Text> : null}

                <Pressable
                    style={[styles.button, (loading || code.length !== 6) && styles.buttonDisabled]}
                    onPress={handleVerify}
                    disabled={loading || code.length !== 6}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Verify</Text>
                    )}
                </Pressable>

                <Pressable onPress={handleResend} disabled={resending}>
                    <Text style={styles.switchText}>
                        Didn't get a code?{" "}
                        <Text style={styles.switchLink}>
                            {resending ? "Sending..." : "Resend code"}
                        </Text>
                    </Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.switchText}>
                        <Text style={styles.switchLink}>Back to login</Text>
                    </Text>
                </Pressable>
            </View>
        </AuthBackground>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        maxWidth: 380,
        alignSelf: "center",
        backgroundColor: "#ffffff",
        borderWidth: 1,
        borderColor: "#ece9e3",
        borderRadius: 16,
        paddingHorizontal: 28,
        paddingTop: 36,
        paddingBottom: 32,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 30,
        elevation: 4,
    },
    title: {
        fontSize: 19,
        fontWeight: "600",
        color: "#1a1a18",
        textAlign: "center",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: "#8a8a84",
        textAlign: "center",
        marginBottom: 22,
    },
    bold: {
        fontWeight: "600",
        color: "#1a1a18",
    },
    label: {
        fontSize: 12,
        color: "#8a8a84",
        marginBottom: 6,
    },
    centerText: {
        textAlign: "center",
    },
    codeInput: {
        borderWidth: 1,
        borderColor: "#e0dfda",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 22,
        letterSpacing: 8,
        color: "#1a1a18",
        textAlign: "center",
        backgroundColor: "#ffffff",
    },
    inputFocused: {
        borderColor: "#1a1a18",
    },
    error: {
        color: "#c0392b",
        fontSize: 13,
        marginTop: 12,
    },
    info: {
        color: "#2f8a5c",
        fontSize: 13,
        marginTop: 12,
    },
    button: {
        height: 42,
        backgroundColor: "#1a1a18",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "600",
    },
    switchText: {
        textAlign: "center",
        fontSize: 13,
        color: "#8a8a84",
        marginTop: 16,
    },
    switchLink: {
        color: "#1a1a18",
        fontWeight: "600",
    },
});

export default VerifyEmailScreen;
