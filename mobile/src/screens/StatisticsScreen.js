import { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getCurrentStreak(dateKeySet) {
    let streak = 0;
    let cursor = new Date();

    if (!dateKeySet.has(toDateKey(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
    }

    while (dateKeySet.has(toDateKey(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
}

function StatisticsScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    // Web'deki TaskFlow.css'e birebir: .priority-fill-high/medium/low sırasıyla
    // --text/--text-secondary/--border-strong kullanıyor (öncelik-özel renk değil).
    const priorityFillColors = useMemo(
        () => ({ high: colors.text, medium: colors.textSecondary, low: colors.borderStrong }),
        [colors]
    );

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            apiClient
                .get("/tasks")
                .then((res) => setTasks(res.data))
                .finally(() => setLoading(false));
        }, [])
    );

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const countsByDay = useMemo(() => {
        const map = {};
        tasks.forEach((task) => {
            if (!task.completedAt) return;
            const key = toDateKey(task.completedAt);
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    }, [tasks]);

    const currentStreak = useMemo(
        () => getCurrentStreak(new Set(Object.keys(countsByDay))),
        [countsByDay]
    );

    const last7Days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = toDateKey(d);
            days.push({
                key,
                label: WEEKDAY_LABELS[d.getDay()],
                count: countsByDay[key] || 0,
                isToday: i === 0,
            });
        }
        return days;
    }, [countsByDay]);

    const maxCount = Math.max(1, ...last7Days.map((d) => d.count));

    const priorityCounts = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0 };
        tasks.forEach((task) => {
            const p = task.priority || "medium";
            if (counts[p] !== undefined) counts[p]++;
        });
        return counts;
    }, [tasks]);

    const maxPriority = Math.max(1, priorityCounts.high, priorityCounts.medium, priorityCounts.low);

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
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Statistics</Text>

                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Completion rate</Text>
                        <Text style={styles.statValue}>{completionRate}%</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Current streak</Text>
                        <Text style={styles.statValue}>
                            {currentStreak} <Text style={styles.statUnit}>days</Text>
                        </Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total completed</Text>
                        <Text style={styles.statValue}>{completedTasks}</Text>
                    </View>
                </View>

                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Last 7 days</Text>
                    <View style={styles.barsRow}>
                        {last7Days.map((day) => (
                            <View key={day.key} style={styles.barCol}>
                                <Text style={styles.barCount}>{day.count}</Text>
                                <View style={styles.barTrack}>
                                    <View
                                        style={[
                                            styles.barFill,
                                            {
                                                height: `${Math.max(4, (day.count / maxCount) * 100)}%`,
                                                backgroundColor: day.count === 0 ? colors.heat0 : colors.heat3,
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={[styles.barLabel, day.isToday && styles.barLabelToday]}>
                                    {day.label}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Priority breakdown</Text>

                    {["high", "medium", "low"].map((p) => (
                        <View key={p} style={styles.priorityRow}>
                            <Text style={styles.priorityLabel}>
                                {p[0].toUpperCase() + p.slice(1)}
                            </Text>
                            <View style={styles.priorityTrack}>
                                <View
                                    style={[
                                        styles.priorityFill,
                                        {
                                            width: `${(priorityCounts[p] / maxPriority) * 100}%`,
                                            backgroundColor: priorityFillColors[p],
                                        },
                                    ]}
                                />
                            </View>
                            <Text style={styles.priorityCount}>{priorityCounts[p]}</Text>
                        </View>
                    ))}
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
        loadingContainer: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        content: {
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
        },
        statsRow: {
            flexDirection: "row",
            gap: 10,
            marginBottom: 20,
        },
        statCard: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 12,
            paddingHorizontal: 8,
            alignItems: "center",
            backgroundColor: colors.surface,
        },
        statLabel: {
            fontSize: 11,
            color: colors.textSecondary,
            marginBottom: 4,
            textAlign: "center",
        },
        statValue: {
            fontSize: 18,
            fontWeight: "700",
            color: colors.text,
        },
        statUnit: {
            fontSize: 12,
            fontWeight: "400",
            color: colors.textSecondary,
        },
        panel: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: colors.surface,
        },
        panelTitle: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 14,
        },
        barsRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-end",
            height: 130,
        },
        barCol: {
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
            height: "100%",
        },
        barCount: {
            fontSize: 11,
            color: colors.textSecondary,
            marginBottom: 4,
        },
        barTrack: {
            width: 14,
            flex: 1,
            justifyContent: "flex-end",
        },
        barFill: {
            width: "100%",
            borderRadius: 4,
            minHeight: 4,
        },
        barLabel: {
            fontSize: 11,
            color: colors.textMuted,
            marginTop: 6,
        },
        barLabelToday: {
            color: colors.text,
            fontWeight: "700",
        },
        priorityRow: {
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 10,
            gap: 10,
        },
        priorityLabel: {
            width: 56,
            fontSize: 12,
            color: colors.textSecondary,
        },
        priorityTrack: {
            flex: 1,
            height: 8,
            backgroundColor: colors.surfaceMuted,
            borderRadius: 4,
            overflow: "hidden",
        },
        priorityFill: {
            height: "100%",
            borderRadius: 4,
        },
        priorityCount: {
            width: 24,
            fontSize: 12,
            color: colors.text,
            textAlign: "right",
        },
    });
}

export default StatisticsScreen;
