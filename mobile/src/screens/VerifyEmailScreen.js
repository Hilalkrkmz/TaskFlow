import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../api/client";
import { setToken } from "../auth/tokenStorage";
import { useTheme } from "../theme/ThemeContext";

function VerifyEmailScreen({ route, onVerifySuccess, navigation }) {
    const { email } = route.params;
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [code, setCode] = useState("");
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
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Verify your email</Text>
                <Text style={styles.subtitle}>
                    We sent a 6-digit code to <Text style={styles.bold}>{email}</Text>
                </Text>

                <Text style={[styles.label, styles.centerText]}>Verification Code</Text>
                <TextInput
                    style={styles.codeInput}
                    value={code}
                    onChangeText={(text) => setCode(text.replace(/\D/g, "").slice(0, 6))}
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
                        <ActivityIndicator color={colors.accentContrast} />
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
        </SafeAreaView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
            justifyContent: "center",
            padding: 24,
        },
        card: {
            width: "100%",
        },
        title: {
            fontSize: 24,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 4,
            textAlign: "center",
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 24,
            textAlign: "center",
        },
        bold: {
            fontWeight: "600",
            color: colors.text,
        },
        label: {
            fontSize: 13,
            color: colors.text,
            marginBottom: 6,
        },
        centerText: {
            textAlign: "center",
        },
        codeInput: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 22,
            letterSpacing: 8,
            color: colors.text,
            textAlign: "center",
            backgroundColor: colors.surface,
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
            backgroundColor: colors.accent,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
            marginTop: 20,
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: colors.accentContrast,
            fontSize: 15,
            fontWeight: "600",
        },
        switchText: {
            textAlign: "center",
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 16,
        },
        switchLink: {
            color: colors.text,
            fontWeight: "600",
        },
    });
}

export default VerifyEmailScreen;
