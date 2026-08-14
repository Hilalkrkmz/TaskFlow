import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// onLogout: RootNavigator'dan geliyor. Sadece Adım 1'in login/logout döngüsünü
// uçtan uca test edebilmek için geçici bir buton - gerçek Home tasarımı geldiğinde
// başka bir yere (ör. Profile ekranı) taşınacak.
function HomeScreen({ onLogout }) {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>TaskFlow</Text>
                <Text style={styles.subtitle}>Mobile app is running ✅</Text>
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
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#1a1a18",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: "#6b6a65",
    },
    logoutButton: {
        marginTop: 24,
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    logoutText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a18",
    },
});

export default HomeScreen;