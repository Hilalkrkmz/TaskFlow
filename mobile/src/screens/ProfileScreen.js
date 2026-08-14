import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function ProfileScreen({ currentUser, onLogout }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
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

                <Pressable style={styles.logoutButton} onPress={onLogout}>
                    <Text style={styles.logoutText}>Log Out</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    content: {
        flex: 1,
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
    logoutButton: {
        marginTop: 24,
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
