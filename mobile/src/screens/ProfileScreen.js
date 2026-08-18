import { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";
import { getErrorMessage } from "../api/errorMessage";
import { useTheme } from "../theme/ThemeContext";

function ProfileScreen({ currentUser, onLogout }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await apiClient.patch("/users/me/password", {
                oldPassword,
                newPassword,
                confirmNewPassword,
            });

            setSuccess("Password updated successfully.");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            setTimeout(() => setShowChangePassword(false), 1500);
        } catch (err) {
            setError(getErrorMessage(err, "Something went wrong. Please try again."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Profile</Text>

                <View style={styles.card}>
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Full Name</Text>
                        <Text style={styles.fieldValue}>{currentUser.fullName}</Text>
                    </View>
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <Text style={styles.fieldValue}>{currentUser.email}</Text>
                    </View>
                </View>

                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Password</Text>
                            <Text style={styles.rowDesc}>Change your account password.</Text>
                        </View>
                        <Pressable
                            style={styles.actionBtn}
                            onPress={() => setShowChangePassword((v) => !v)}
                        >
                            <Ionicons name="key-outline" size={15} color={colors.text} />
                            <Text style={styles.actionBtnText}>Change</Text>
                        </Pressable>
                    </View>

                    {showChangePassword && (
                        <View style={styles.passwordForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Current password"
                                placeholderTextColor={colors.textMuted}
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="New password"
                                placeholderTextColor={colors.textMuted}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.textMuted}
                                value={confirmNewPassword}
                                onChangeText={setConfirmNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />

                            {error ? <Text style={styles.error}>{error}</Text> : null}
                            {success ? <Text style={styles.success}>{success}</Text> : null}

                            <Pressable
                                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.accentContrast} />
                                ) : (
                                    <Text style={styles.submitBtnText}>Update Password</Text>
                                )}
                            </Pressable>
                        </View>
                    )}
                </View>

                <Pressable style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>
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
        content: {
            padding: 24,
        },
        title: {
            fontSize: 24,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 20,
        },
        card: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: colors.surface,
        },
        field: {
            marginBottom: 12,
        },
        fieldLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginBottom: 2,
        },
        fieldValue: {
            fontSize: 15,
            color: colors.text,
        },
        row: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        rowText: {
            flex: 1,
            marginRight: 12,
        },
        rowTitle: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
        },
        rowDesc: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        actionBtn: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
        },
        actionBtnText: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
        },
        passwordForm: {
            marginTop: 16,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.text,
            marginBottom: 10,
        },
        error: {
            color: "#c0392b",
            fontSize: 13,
            marginBottom: 10,
        },
        success: {
            color: "#2f8a5c",
            fontSize: 13,
            marginBottom: 10,
        },
        submitBtn: {
            backgroundColor: colors.accent,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
        },
        submitBtnDisabled: {
            opacity: 0.6,
        },
        submitBtnText: {
            color: colors.accentContrast,
            fontSize: 15,
            fontWeight: "600",
        },
        logoutButton: {
            marginTop: 8,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
        },
        logoutText: {
            fontSize: 15,
            fontWeight: "600",
            color: "#c0392b",
        },
    });
}

export default ProfileScreen;
