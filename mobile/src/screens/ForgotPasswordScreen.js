import { useState } from "react";
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

// 3 adım:
// step 1: email gir -> kod gönderilsin
// step 2: kodu gir -> backend'e "geçerli mi" diye sor, geçerliyse step 3'e geç
// step 3: yeni şifre + tekrar gir -> gerçekten değiştir
function ForgotPasswordScreen({ navigation }) {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendCode = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/forgot-password", { email });
            setInfo(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        setError("");
        setInfo("");
        setLoading(true);

        try {
            await apiClient.post("/auth/verify-reset-code", { email, code });
            setStep(3);
        } catch (err) {
            setError(err.response?.data?.error || "Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/reset-password", {
                email,
                code,
                newPassword,
                confirmNewPassword,
            });
            setInfo(response.data.message);

            setTimeout(() => {
                navigation.navigate("Login");
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    {step === 1 && "Reset your password"}
                    {step === 2 && "Enter verification code"}
                    {step === 3 && "Set a new password"}
                </Text>
                <Text style={styles.subtitle}>
                    {step === 1 && "We'll email you a code to reset your password"}
                    {step === 2 && (
                        <>We sent a code to <Text style={styles.bold}>{email}</Text></>
                    )}
                    {step === 3 && "Choose a new password for your account"}
                </Text>

                {step === 1 && (
                    <>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}

                        <Pressable
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleSendCode}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Send Code</Text>
                            )}
                        </Pressable>
                    </>
                )}

                {step === 2 && (
                    <>
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

                        <Pressable
                            style={[styles.button, (loading || code.length !== 6) && styles.buttonDisabled]}
                            onPress={handleVerifyCode}
                            disabled={loading || code.length !== 6}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Verify Code</Text>
                            )}
                        </Pressable>
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text style={styles.label}>New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Confirm New Password</Text>
                        <TextInput
                            style={styles.input}
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        {info ? <Text style={styles.info}>{info}</Text> : null}

                        <Pressable
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleResetPassword}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Reset Password</Text>
                            )}
                        </Pressable>
                    </>
                )}

                <Pressable onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.switchText}>
                        <Text style={styles.switchLink}>Back to login</Text>
                    </Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        padding: 24,
    },
    card: {
        width: "100%",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#1a1a18",
        marginBottom: 4,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 14,
        color: "#6b6a65",
        marginBottom: 24,
        textAlign: "center",
    },
    bold: {
        fontWeight: "600",
        color: "#1a1a18",
    },
    label: {
        fontSize: 13,
        color: "#1a1a18",
        marginBottom: 6,
        marginTop: 12,
    },
    centerText: {
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#1a1a18",
    },
    codeInput: {
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 22,
        letterSpacing: 8,
        color: "#1a1a18",
        textAlign: "center",
    },
    error: {
        color: "#c0392b",
        fontSize: 13,
        marginTop: 12,
    },
    info: {
        color: "#2e7d32",
        fontSize: 13,
        marginTop: 12,
    },
    button: {
        backgroundColor: "#1a1a18",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 20,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    switchText: {
        textAlign: "center",
        fontSize: 13,
        color: "#6b6a65",
        marginTop: 16,
    },
    switchLink: {
        color: "#1a1a18",
        fontWeight: "600",
    },
});

export default ForgotPasswordScreen;
