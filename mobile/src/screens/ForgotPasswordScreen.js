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
import { getErrorMessage } from "../api/errorMessage";
import AuthBackground from "../components/AuthBackground";

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
    const [focusedField, setFocusedField] = useState(null);

    const [error, setError] = useState("");
    const [info, setInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const inputStyle = (field) => [styles.input, focusedField === field && styles.inputFocused];

    const handleSendCode = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/forgot-password", { email });
            setInfo(response.data.message);
            setStep(2);
        } catch (err) {
            setError(getErrorMessage(err, "Something went wrong."));
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
            setError(getErrorMessage(err, "Invalid or expired code."));
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
            setError(getErrorMessage(err, "Something went wrong."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
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
                            style={inputStyle("email")}
                            value={email}
                            onChangeText={setEmail}
                            onFocus={() => setFocusedField("email")}
                            onBlur={() => setFocusedField(null)}
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
                                <ActivityIndicator color="#ffffff" />
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
                            style={[styles.codeInput, focusedField === "code" && styles.inputFocused]}
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/\D/g, "").slice(0, 6))}
                            onFocus={() => setFocusedField("code")}
                            onBlur={() => setFocusedField(null)}
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
                                <ActivityIndicator color="#ffffff" />
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
                            style={inputStyle("newPassword")}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            onFocus={() => setFocusedField("newPassword")}
                            onBlur={() => setFocusedField(null)}
                            secureTextEntry
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Confirm New Password</Text>
                        <TextInput
                            style={inputStyle("confirmNewPassword")}
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                            onFocus={() => setFocusedField("confirmNewPassword")}
                            onBlur={() => setFocusedField(null)}
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
                                <ActivityIndicator color="#ffffff" />
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
        marginTop: 14,
    },
    centerText: {
        textAlign: "center",
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: "#e0dfda",
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        color: "#1a1a18",
        backgroundColor: "#ffffff",
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

export default ForgotPasswordScreen;
