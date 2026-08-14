import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";

function RegisterScreen({ navigation }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

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

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.card}>
                    <Text style={styles.title}>Create your account</Text>
                    <Text style={styles.subtitle}>Start managing your tasks with TaskFlow</Text>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        autoComplete="name"
                    />

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

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
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
                            <ActivityIndicator color={colors.accentContrast} />
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
        </SafeAreaView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.bg,
        },
        scrollContent: {
            flexGrow: 1,
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
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginBottom: 24,
        },
        label: {
            fontSize: 13,
            color: colors.text,
            marginBottom: 6,
            marginTop: 12,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.text,
            backgroundColor: colors.surface,
        },
        error: {
            color: "#c0392b",
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

export default RegisterScreen;
