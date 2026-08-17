import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import apiClient from "../api/client";
import AuthBackground from "../components/AuthBackground";

function RegisterScreen({ navigation }) {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [focusedField, setFocusedField] = useState(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        setError("");
        setLoading(true);

        try {
            await apiClient.post("/auth/register", {
                fullName,
                email,
                password,
                confirmPassword,
            });

            navigation.navigate("VerifyEmail", { email });
        } catch (err) {
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = (field) => [styles.input, focusedField === field && styles.inputFocused];

    return (
        <AuthBackground>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.card}>
                    <Text style={styles.title}>Create your account</Text>
                    <Text style={styles.subtitle}>Start managing your tasks with TaskFlow</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={inputStyle("fullName")}
                        value={fullName}
                        onChangeText={setFullName}
                        onFocus={() => setFocusedField("fullName")}
                        onBlur={() => setFocusedField(null)}
                        autoComplete="name"
                    />

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

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={inputStyle("password")}
                        value={password}
                        onChangeText={setPassword}
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={inputStyle("confirmPassword")}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setFocusedField("confirmPassword")}
                        onBlur={() => setFocusedField(null)}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    {error ? <Text style={styles.error}>{error}</Text> : null}

                    <Pressable
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text style={styles.buttonText}>Register</Text>
                        )}
                    </Pressable>

                    <Pressable onPress={() => navigation.navigate("Login")}>
                        <Text style={styles.switchText}>
                            Already have an account? <Text style={styles.switchLink}>Log in</Text>
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </AuthBackground>
    );
}

const styles = StyleSheet.create({
    scroll: {
        flex: 1,
        width: "100%",
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
    },
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

export default RegisterScreen;
