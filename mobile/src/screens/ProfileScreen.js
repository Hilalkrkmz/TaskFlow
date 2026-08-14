import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";

function ProfileScreen({ currentUser, onLogout }) {
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
            setError(err.response?.data?.error || "Something went wrong. Please try again.");
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
                            <Ionicons name="key-outline" size={15} color="#1a1a18" />
                            <Text style={styles.actionBtnText}>Change</Text>
                        </Pressable>
                    </View>

                    {showChangePassword && (
                        <View style={styles.passwordForm}>
                            <TextInput
                                style={styles.input}
                                placeholder="Current password"
                                value={oldPassword}
                                onChangeText={setOldPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="New password"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm new password"
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
                                    <ActivityIndicator color="#ffffff" />
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    content: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#1a1a18",
        marginBottom: 20,
    },
    card: {
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    field: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 12,
        color: "#6b6a65",
        marginBottom: 2,
    },
    fieldValue: {
        fontSize: 15,
        color: "#1a1a18",
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
        color: "#1a1a18",
    },
    rowDesc: {
        fontSize: 12,
        color: "#6b6a65",
        marginTop: 2,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#1a1a18",
    },
    passwordForm: {
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#1a1a18",
        marginBottom: 10,
    },
    error: {
        color: "#c0392b",
        fontSize: 13,
        marginBottom: 10,
    },
    success: {
        color: "#2e7d32",
        fontSize: 13,
        marginBottom: 10,
    },
    submitBtn: {
        backgroundColor: "#1a1a18",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    submitBtnDisabled: {
        opacity: 0.6,
    },
    submitBtnText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    logoutButton: {
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#d9d8d3",
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

export default ProfileScreen;
