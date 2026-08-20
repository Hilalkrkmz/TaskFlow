import { useCallback, useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";
import { getErrorMessage } from "../api/errorMessage";
import { useTheme } from "../theme/ThemeContext";

const PRIORITIES = ["high", "medium", "low"];
const PRIORITY_WEIGHT = { high: 3, medium: 2, low: 1 };

const FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "completed", label: "Completed" },
];

const SORTS = [
    { key: "created", label: "Sort: Created" },
    { key: "priority", label: "Sort: Priority" },
];

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function HomeScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const priorityColors = useMemo(
        () => ({
            high: colors.priorityHighText,
            medium: colors.priorityMediumText,
            low: colors.priorityLowText,
        }),
        [colors]
    );

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [priority, setPriority] = useState("medium");
    const [filter, setFilter] = useState("all");
    const [sortBy, setSortBy] = useState("created");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

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

    const addTask = async () => {
        if (!text.trim()) return;

        try {
            const response = await apiClient.post("/tasks", { text, priority });
            setTasks((prev) => [...prev, response.data]);
            setText("");
            setPriority("medium");
        } catch (err) {
            Alert.alert("Couldn't add task", getErrorMessage(err, "Something went wrong. Please try again."));
        }
    };

    const toggleTask = async (task) => {
        try {
            const response = await apiClient.patch(`/tasks/${task.id}`, {
                completed: !task.completed,
            });
            setTasks((prev) => prev.map((t) => (t.id === task.id ? response.data : t)));
        } catch (err) {
            Alert.alert("Couldn't update task", getErrorMessage(err, "Something went wrong. Please try again."));
        }
    };

    const deleteTask = async (id) => {
        try {
            await apiClient.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            Alert.alert("Couldn't delete task", getErrorMessage(err, "Something went wrong. Please try again."));
        }
    };

    const startEdit = (task) => {
        setEditingId(task.id);
        setEditText(task.text);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const saveEdit = async () => {
        if (!editText.trim()) return;

        try {
            const response = await apiClient.patch(`/tasks/${editingId}`, { text: editText });
            setTasks((prev) => prev.map((t) => (t.id === editingId ? response.data : t)));
            setEditingId(null);
            setEditText("");
        } catch (err) {
            Alert.alert("Couldn't update task", getErrorMessage(err, "Something went wrong. Please try again."));
        }
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;

    const filteredTasks = tasks.filter((t) => {
        if (filter === "active") return !t.completed;
        if (filter === "completed") return t.completed;
        return true;
    });

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === "priority") {
            return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const renderTask = ({ item }) => {
        if (item.id === editingId) {
            return (
                <View style={styles.taskRow}>
                    <TextInput
                        style={styles.editInput}
                        value={editText}
                        onChangeText={setEditText}
                        autoFocus
                        onSubmitEditing={saveEdit}
                    />
                    <Pressable onPress={saveEdit}>
                        <Ionicons name="checkmark" size={20} color={colors.statCompleted} />
                    </Pressable>
                    <Pressable onPress={cancelEdit}>
                        <Ionicons name="close" size={20} color={colors.textSecondary} />
                    </Pressable>
                </View>
            );
        }

        return (
            <View style={styles.taskRow}>
                <Pressable
                    style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                    onPress={() => toggleTask(item)}
                >
                    {item.completed && (
                        <Ionicons name="checkmark" size={16} color={colors.accentContrast} />
                    )}
                </Pressable>

                <View style={styles.taskMain}>
                    <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>
                        {item.text}
                    </Text>
                    <Text style={styles.taskDate}>{formatDate(item.createdAt)}</Text>
                </View>

                <View style={[styles.priorityDot, { backgroundColor: priorityColors[item.priority] }]} />

                {!item.completed && (
                    <Pressable onPress={() => startEdit(item)}>
                        <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                    </Pressable>
                )}

                <Pressable onPress={() => deleteTask(item.id)}>
                    <Ionicons name="trash-outline" size={18} color={colors.textSecondary} />
                </Pressable>
            </View>
        );
    };

    const ListHeader = (
        <View style={styles.header}>
            <Text style={styles.title}>TaskFlow</Text>

            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{totalTasks}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{completedTasks}</Text>
                    <Text style={styles.statLabel}>Completed</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{remainingTasks}</Text>
                    <Text style={styles.statLabel}>Remaining</Text>
                </View>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="What do you want to do?"
                    placeholderTextColor={colors.textMuted}
                    value={text}
                    onChangeText={setText}
                    onSubmitEditing={addTask}
                />

                <View style={styles.priorityPicker}>
                    {PRIORITIES.map((p) => (
                        <Pressable
                            key={p}
                            style={[styles.priorityPill, priority === p && styles.priorityPillActive]}
                            onPress={() => setPriority(p)}
                        >
                            <Text
                                style={[
                                    styles.priorityPillText,
                                    priority === p && styles.priorityPillTextActive,
                                ]}
                            >
                                {p[0].toUpperCase() + p.slice(1)}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={styles.addButton} onPress={addTask}>
                    <Ionicons name="add" size={18} color={colors.accentContrast} />
                    <Text style={styles.addButtonText}>Add Task</Text>
                </Pressable>
            </View>

            <View style={styles.listHeaderRow}>
                <Text style={styles.listTitle}>My Tasks</Text>
            </View>

            <View style={styles.filterRow}>
                {FILTERS.map((f) => (
                    <Pressable
                        key={f.key}
                        style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text
                            style={[
                                styles.filterPillText,
                                filter === f.key && styles.filterPillTextActive,
                            ]}
                        >
                            {f.label}
                        </Text>
                    </Pressable>
                ))}
            </View>

            <View style={styles.sortRow}>
                {SORTS.map((s) => (
                    <Pressable
                        key={s.key}
                        style={[styles.sortPill, sortBy === s.key && styles.sortPillActive]}
                        onPress={() => setSortBy(s.key)}
                    >
                        <Text
                            style={[styles.sortPillText, sortBy === s.key && styles.sortPillTextActive]}
                        >
                            {s.label}
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );

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
            <FlatList
                data={sortedTasks}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderTask}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet</Text>}
                contentContainerStyle={styles.listContent}
            />
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
        listContent: {
            paddingHorizontal: 20,
            paddingBottom: 24,
            width: "100%",
            maxWidth: 480,
            alignSelf: "center",
        },
        header: {
            paddingTop: 12,
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
            alignItems: "center",
            backgroundColor: colors.surface,
        },
        statValue: {
            fontSize: 20,
            fontWeight: "700",
            color: colors.text,
        },
        statLabel: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 2,
        },
        form: {
            marginBottom: 20,
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
            backgroundColor: colors.surface,
        },
        priorityPicker: {
            flexDirection: "row",
            gap: 8,
            marginBottom: 10,
        },
        priorityPill: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 8,
            alignItems: "center",
        },
        priorityPillActive: {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        priorityPillText: {
            fontSize: 13,
            color: colors.text,
        },
        priorityPillTextActive: {
            color: colors.accentContrast,
            fontWeight: "600",
        },
        addButton: {
            flexDirection: "row",
            gap: 6,
            backgroundColor: colors.accent,
            borderRadius: 8,
            paddingVertical: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        addButtonText: {
            color: colors.accentContrast,
            fontSize: 15,
            fontWeight: "600",
        },
        listHeaderRow: {
            marginBottom: 10,
        },
        listTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: colors.text,
        },
        filterRow: {
            flexDirection: "row",
            gap: 8,
            marginBottom: 8,
        },
        filterPill: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 14,
        },
        filterPillActive: {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        filterPillText: {
            fontSize: 13,
            color: colors.text,
        },
        filterPillTextActive: {
            color: colors.accentContrast,
            fontWeight: "600",
        },
        sortRow: {
            flexDirection: "row",
            gap: 8,
            marginBottom: 14,
        },
        sortPill: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 14,
        },
        sortPillActive: {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.accent,
        },
        sortPillText: {
            fontSize: 12,
            color: colors.textSecondary,
        },
        sortPillTextActive: {
            color: colors.text,
            fontWeight: "600",
        },
        taskRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            marginBottom: 8,
            backgroundColor: colors.surface,
        },
        checkbox: {
            width: 22,
            height: 22,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
        },
        checkboxChecked: {
            backgroundColor: colors.accent,
            borderColor: colors.accent,
        },
        taskMain: {
            flex: 1,
        },
        taskText: {
            fontSize: 15,
            color: colors.text,
        },
        taskDate: {
            fontSize: 11,
            color: colors.textMuted,
            marginTop: 2,
        },
        taskTextDone: {
            textDecorationLine: "line-through",
            color: colors.textMuted,
        },
        priorityDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
        },
        editInput: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 6,
            paddingHorizontal: 10,
            paddingVertical: 6,
            fontSize: 15,
            color: colors.text,
        },
        emptyText: {
            textAlign: "center",
            color: colors.textSecondary,
            fontSize: 14,
            marginTop: 20,
        },
    });
}

export default HomeScreen;
