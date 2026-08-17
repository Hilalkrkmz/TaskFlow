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

function LoginScreen({ onLoginSuccess, navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError("");
        setLoading(true);

        try {
            const response = await apiClient.post("/auth/login", {
                email,
                password,
            });

            const { token, fullName, email: userEmail, theme } = response.data;

            await setToken(token);
            onLoginSuccess({ fullName, email: userEmail, theme });
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthBackground>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Log in to continue to TaskFlow</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={[styles.input, emailFocused && styles.inputFocused]}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={[styles.input, passwordFocused && styles.inputFocused]}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry
                    autoCapitalize="none"
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.buttonText}>Log In</Text>
                    )}
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Register")}>
                    <Text style={styles.switchText}>
                        Don't have an account? <Text style={styles.switchLink}>Register</Text>
                    </Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.switchText}>
                        <Text style={styles.switchLink}>Forgot password?</Text>
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
    label: {
        fontSize: 12,
        color: "#8a8a84",
        marginBottom: 6,
        marginTop: 14,
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
    inputFocused: {
        borderColor: "#1a1a18",
    },
    error: {
        color: "#c0392b",
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

export default LoginScreen;
