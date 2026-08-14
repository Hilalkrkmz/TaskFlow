import { useCallback, useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import apiClient from "../api/client";

const PRIORITIES = ["high", "medium", "low"];

const PRIORITY_COLORS = {
    high: "#c0392b",
    medium: "#b8860b",
    low: "#2e7d32",
};

function HomeScreen() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [priority, setPriority] = useState("medium");

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

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async () => {
        if (!text.trim()) return;

        try {
            const response = await apiClient.post("/tasks", { text, priority });
            setTasks((prev) => [...prev, response.data]);
            setText("");
            setPriority("medium");
        } catch (err) {
            console.error("Görev eklenemedi:", err);
        }
    };

    const toggleTask = async (task) => {
        try {
            const response = await apiClient.patch(`/tasks/${task.id}`, {
                completed: !task.completed,
            });
            setTasks((prev) => prev.map((t) => (t.id === task.id ? response.data : t)));
        } catch (err) {
            console.error("Görev güncellenemedi:", err);
        }
    };

    const deleteTask = async (id) => {
        try {
            await apiClient.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t.id !== id));
        } catch (err) {
            console.error("Görev silinemedi:", err);
        }
    };

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.completed).length;
    const remainingTasks = totalTasks - completedTasks;

    const renderTask = ({ item }) => (
        <View style={styles.taskRow}>
            <Pressable
                style={[styles.checkbox, item.completed && styles.checkboxChecked]}
                onPress={() => toggleTask(item)}
            >
                {item.completed && <Ionicons name="checkmark" size={16} color="#ffffff" />}
            </Pressable>

            <Text style={[styles.taskText, item.completed && styles.taskTextDone]}>
                {item.text}
            </Text>

            <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[item.priority] }]} />

            <Pressable onPress={() => deleteTask(item.id)}>
                <Ionicons name="trash-outline" size={18} color="#6b6a65" />
            </Pressable>
        </View>
    );

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
                    <Ionicons name="add" size={18} color="#ffffff" />
                    <Text style={styles.addButtonText}>Add Task</Text>
                </Pressable>
            </View>

            <Text style={styles.listTitle}>My Tasks</Text>
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
                data={tasks}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderTask}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet</Text>}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    header: {
        paddingTop: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: "600",
        color: "#1a1a18",
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
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
    },
    statValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a18",
    },
    statLabel: {
        fontSize: 12,
        color: "#6b6a65",
        marginTop: 2,
    },
    form: {
        marginBottom: 20,
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
    priorityPicker: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 10,
    },
    priorityPill: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: "center",
    },
    priorityPillActive: {
        backgroundColor: "#1a1a18",
        borderColor: "#1a1a18",
    },
    priorityPillText: {
        fontSize: 13,
        color: "#1a1a18",
    },
    priorityPillTextActive: {
        color: "#ffffff",
        fontWeight: "600",
    },
    addButton: {
        flexDirection: "row",
        gap: 6,
        backgroundColor: "#1a1a18",
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    addButtonText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "600",
    },
    listTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1a1a18",
        marginBottom: 10,
    },
    taskRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        marginBottom: 8,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: "#d9d8d3",
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
    },
    checkboxChecked: {
        backgroundColor: "#1a1a18",
        borderColor: "#1a1a18",
    },
    taskText: {
        flex: 1,
        fontSize: 15,
        color: "#1a1a18",
    },
    taskTextDone: {
        textDecorationLine: "line-through",
        color: "#a9a8a3",
    },
    priorityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    emptyText: {
        textAlign: "center",
        color: "#6b6a65",
        fontSize: 14,
        marginTop: 20,
    },
});

export default HomeScreen;
