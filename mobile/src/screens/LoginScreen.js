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
import { setToken } from "../auth/tokenStorage";

function LoginScreen({ onLoginSuccess, navigation }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Welcome back</Text>
                <Text style={styles.subtitle}>Log in to continue to TaskFlow</Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                />

                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
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
                        <ActivityIndicator color="#fff" />
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
    },
    subtitle: {
        fontSize: 14,
        color: "#6b6a65",
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        color: "#1a1a18",
        marginBottom: 6,
        marginTop: 12,
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
    error: {
        color: "#c0392b",
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

export default LoginScreen;
