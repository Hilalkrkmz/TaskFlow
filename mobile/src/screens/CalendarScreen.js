import { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function toDateKey(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getHeatLevel(count) {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
}

function chunk(array, size) {
    const rows = [];
    for (let i = 0; i < array.length; i += size) {
        rows.push(array.slice(i, i + size));
    }
    return rows;
}

function CalendarScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    // Web'deki TaskFlow.css'te heat-0/1 seviyeleri textMuted/textSecondary,
    // heat-2..4 heatTextDark kullanıyor - birebir aynı eşleme.
    const heatColors = useMemo(
        () => [colors.heat0, colors.heat1, colors.heat2, colors.heat3, colors.heat4],
        [colors]
    );
    const heatTextColors = useMemo(
        () => [colors.textMuted, colors.textSecondary, colors.heatTextDark, colors.heatTextDark, colors.heatTextDark],
        [colors]
    );

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDate, setSelectedDate] = useState(null);

    const fetchTasks = useCallback(async () => {
        try {
            const response = await apiClient.get("/tasks");
            setTasks(response.data);
        } catch (err) {
            console.error("Görevler yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTasks();
        }, [fetchTasks])
    );

    const countsByDay = useMemo(() => {
        const map = {};
        tasks.forEach((task) => {
            if (!task.completedAt) return;
            const key = toDateKey(task.completedAt);
            map[key] = (map[key] || 0) + 1;
        });
        return map;
    }, [tasks]);

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

    const cells = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
    while (cells.length % 7 !== 0) cells.push(null);
    const weeks = chunk(cells, 7);

    const goToPrevMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const selectedTasks = selectedDate
        ? tasks.filter((task) => task.completedAt && toDateKey(task.completedAt) === selectedDate)
        : [];

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
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>
                        {MONTH_NAMES[month]} {year}
                    </Text>
                    <View style={styles.nav}>
                        <Pressable style={styles.navButton} onPress={goToPrevMonth}>
                            <Ionicons name="chevron-back" size={18} color={colors.text} />
                        </Pressable>
                        <Pressable style={styles.navButton} onPress={goToNextMonth}>
                            <Ionicons name="chevron-forward" size={18} color={colors.text} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.weekdayRow}>
                    {WEEKDAYS.map((day) => (
                        <Text key={day} style={styles.weekday}>
                            {day}
                        </Text>
                    ))}
                </View>

                {weeks.map((week, i) => (
                    <View key={i} style={styles.weekRow}>
                        {week.map((date, j) => {
                            if (!date) return <View key={j} style={styles.cell} />;

                            const key = toDateKey(date);
                            const level = getHeatLevel(countsByDay[key] || 0);
                            const isSelected = selectedDate === key;

                            return (
                                <Pressable
                                    key={j}
                                    style={[
                                        styles.cell,
                                        styles.dayCell,
                                        { backgroundColor: heatColors[level] },
                                        isSelected && styles.dayCellSelected,
                                    ]}
                                    onPress={() => setSelectedDate(isSelected ? null : key)}
                                >
                                    <Text style={[styles.dayNum, { color: heatTextColors[level] }]}>
                                        {date.getDate()}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ))}

                <View style={styles.legend}>
                    <Text style={styles.legendLabel}>low</Text>
                    {heatColors.map((color, i) => (
                        <View key={i} style={[styles.legendSwatch, { backgroundColor: color }]} />
                    ))}
                    <Text style={styles.legendLabel}>high</Text>
                </View>

                {selectedDate && (
                    <View style={styles.detail}>
                        <Text style={styles.detailTitle}>
                            {new Date(selectedDate).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                            })}{" "}
                            — completed tasks
                        </Text>

                        {selectedTasks.length === 0 ? (
                            <Text style={styles.detailEmpty}>No tasks completed this day.</Text>
                        ) : (
                            selectedTasks.map((task) => (
                                <View key={task.id} style={styles.detailRow}>
                                    <Ionicons name="checkmark-circle" size={15} color={colors.statCompleted} />
                                    <Text style={styles.detailText}>{task.text}</Text>
                                </View>
                            ))
                        )}
                    </View>
                )}
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
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: "600",
            color: colors.text,
        },
        nav: {
            flexDirection: "row",
            gap: 6,
        },
        navButton: {
            width: 30,
            height: 30,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: 6,
            alignItems: "center",
            justifyContent: "center",
        },
        weekdayRow: {
            flexDirection: "row",
            marginBottom: 4,
        },
        weekday: {
            flex: 1,
            textAlign: "center",
            fontSize: 11,
            color: colors.textMuted,
        },
        weekRow: {
            flexDirection: "row",
        },
        cell: {
            flex: 1,
            aspectRatio: 1,
            margin: 2,
        },
        dayCell: {
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
        },
        dayCellSelected: {
            borderWidth: 2,
            borderColor: colors.accent,
        },
        dayNum: {
            fontSize: 13,
            fontWeight: "500",
        },
        legend: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
        },
        legendLabel: {
            fontSize: 11,
            color: colors.textMuted,
        },
        legendSwatch: {
            width: 14,
            height: 14,
            borderRadius: 4,
        },
        detail: {
            marginTop: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: 14,
        },
        detailTitle: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 8,
        },
        detailEmpty: {
            fontSize: 13,
            color: colors.textSecondary,
        },
        detailRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        detailText: {
            fontSize: 13,
            color: colors.text,
        },
    });
}

export default CalendarScreen;
