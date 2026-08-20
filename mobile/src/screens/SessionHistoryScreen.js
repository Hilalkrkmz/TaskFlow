import { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, SectionList, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";
import { getErrorMessage } from "../api/errorMessage";
import { useTheme } from "../theme/ThemeContext";
import { SESSION_TYPE_ICONS, SESSION_TYPE_LABELS, formatSessionMinutes } from "../constants/focusSession";

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatClock(dateStr) {
    const d = new Date(dateStr);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function groupLabel(dateKey) {
    const now = new Date();
    const todayKey = toDateKey(now);

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = toDateKey(yesterday);

    if (dateKey === todayKey) return "Today";
    if (dateKey === yesterdayKey) return "Yesterday";

    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const isCurrentYear = y === now.getFullYear();

    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        ...(isCurrentYear ? {} : { year: "numeric" }),
    });
}

function SessionHistoryScreen({ navigation }) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            apiClient
                .get("/focus-sessions")
                .then((res) => setSessions(res.data))
                .catch((err) => console.error("Session history couldn't be loaded:", err))
                .finally(() => setLoading(false));
        }, [])
    );

    const deleteSession = async (id) => {
        try {
            await apiClient.delete(`/focus-sessions/${id}`);
            setSessions((prev) => prev.filter((s) => s.id !== id));
        } catch (err) {
            Alert.alert("Couldn't delete session", getErrorMessage(err, "Something went wrong. Please try again."));
        }
    };

    const sections = useMemo(() => {
        // Backend zaten en yeniden eskiye (startTime desc) veriyor, o yuzden
        // gruplama sirasinda tekrar sort etmeye gerek yok, siralamayi koruyoruz.
        const map = new Map();
        sessions.forEach((s) => {
            const key = toDateKey(s.startTime);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(s);
        });

        return Array.from(map.entries())
            .sort((a, b) => (a[0] < b[0] ? 1 : -1))
            .map(([key, items]) => ({ title: groupLabel(key), data: items }));
    }, [sessions]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={22} color={colors.text} />
                </Pressable>
                <Text style={styles.headerTitle}>Session History</Text>
                <View style={styles.backBtn} />
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => String(item.id)}
                renderSectionHeader={({ section }) => (
                    <Text style={styles.sectionHeader}>{section.title}</Text>
                )}
                renderItem={({ item }) => (
                    <View style={styles.row}>
                        <Ionicons name={SESSION_TYPE_ICONS[item.type]} size={18} color={colors.textSecondary} />
                        <View style={styles.rowMain}>
                            <Text style={styles.rowType}>{SESSION_TYPE_LABELS[item.type]}</Text>
                            {item.taskText && <Text style={styles.rowTask}>{item.taskText}</Text>}
                            <Text style={styles.rowTimeRange}>
                                {formatClock(item.startTime)} – {formatClock(item.endTime)}
                            </Text>
                        </View>
                        <Text style={styles.rowDuration}>{formatSessionMinutes(item.durationSeconds)}</Text>
                        <Pressable onPress={() => deleteSession(item.id)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                        </Pressable>
                    </View>
                )}
                ListEmptyComponent={<Text style={styles.emptyText}>No sessions logged yet.</Text>}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

function createStyles(colors) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.bg },
        loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 12,
            paddingVertical: 10,
        },
        backBtn: { width: 32, height: 32, alignItems: "center", justifyContent: "center" },
        headerTitle: { fontSize: 17, fontWeight: "600", color: colors.text },
        listContent: {
            paddingHorizontal: 20,
            paddingBottom: 24,
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
        },
        sectionHeader: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.textSecondary,
            backgroundColor: colors.bg,
            paddingTop: 14,
            paddingBottom: 6,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        rowMain: { flex: 1 },
        rowType: { fontSize: 14, fontWeight: "600", color: colors.text },
        rowTask: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
        rowTimeRange: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
        rowDuration: { fontSize: 13, fontWeight: "600", color: colors.text },
        emptyText: { textAlign: "center", color: colors.textSecondary, fontSize: 14, marginTop: 20 },
    });
}

export default SessionHistoryScreen;
