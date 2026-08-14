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

function formatDate(isoString) {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NotesScreen() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");

    const fetchNotes = useCallback(async () => {
        try {
            const response = await apiClient.get("/notes");
            setNotes(response.data);
        } catch (err) {
            console.error("Notlar yüklenemedi:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const addNote = async () => {
        if (!text.trim()) return;

        try {
            const response = await apiClient.post("/notes", { text });
            setNotes((prev) => [response.data, ...prev]);
            setText("");
        } catch (err) {
            console.error("Not eklenemedi:", err);
        }
    };

    const deleteNote = async (id) => {
        try {
            await apiClient.delete(`/notes/${id}`);
            setNotes((prev) => prev.filter((n) => n.id !== id));
        } catch (err) {
            console.error("Not silinemedi:", err);
        }
    };

    const startEdit = (note) => {
        setEditingId(note.id);
        setEditText(note.text);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditText("");
    };

    const saveEdit = async () => {
        if (!editText.trim()) return;

        try {
            const response = await apiClient.patch(`/notes/${editingId}`, { text: editText });
            setNotes((prev) => prev.map((n) => (n.id === editingId ? response.data : n)));
            setEditingId(null);
            setEditText("");
        } catch (err) {
            console.error("Not güncellenemedi:", err);
        }
    };

    const renderNote = ({ item }) => {
        if (item.id === editingId) {
            return (
                <View style={styles.noteCard}>
                    <TextInput
                        style={[styles.textarea, styles.editTextarea]}
                        value={editText}
                        onChangeText={setEditText}
                        multiline
                        numberOfLines={3}
                        autoFocus
                    />
                    <View style={styles.noteFooter}>
                        <Pressable style={styles.editActionBtn} onPress={saveEdit}>
                            <Text style={styles.editSaveText}>Save</Text>
                        </Pressable>
                        <Pressable style={styles.editActionBtn} onPress={cancelEdit}>
                            <Text style={styles.editCancelText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.noteCard}>
                <Text style={styles.noteText}>{item.text}</Text>
                <View style={styles.noteFooter}>
                    <Text style={styles.noteDate}>{formatDate(item.createdAt)}</Text>
                    <View style={styles.noteActions}>
                        <Pressable onPress={() => startEdit(item)}>
                            <Ionicons name="pencil-outline" size={18} color="#6b6a65" />
                        </Pressable>
                        <Pressable onPress={() => deleteNote(item.id)}>
                            <Ionicons name="trash-outline" size={18} color="#6b6a65" />
                        </Pressable>
                    </View>
                </View>
            </View>
        );
    };

    const ListHeader = (
        <View style={styles.header}>
            <Text style={styles.title}>Notes</Text>

            <View style={styles.form}>
                <TextInput
                    style={styles.textarea}
                    placeholder="Write a quick note..."
                    value={text}
                    onChangeText={setText}
                    multiline
                    numberOfLines={3}
                />
                <Pressable style={styles.addButton} onPress={addNote}>
                    <Ionicons name="add" size={18} color="#ffffff" />
                    <Text style={styles.addButtonText}>Add Note</Text>
                </Pressable>
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
                data={notes}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderNote}
                ListHeaderComponent={ListHeader}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No notes yet. Add your first one above.</Text>
                }
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
    form: {
        marginBottom: 20,
    },
    textarea: {
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
        color: "#1a1a18",
        marginBottom: 10,
        minHeight: 80,
        textAlignVertical: "top",
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
    noteCard: {
        borderWidth: 1,
        borderColor: "#d9d8d3",
        borderRadius: 8,
        padding: 14,
        marginBottom: 10,
    },
    noteText: {
        fontSize: 14,
        color: "#1a1a18",
        marginBottom: 10,
    },
    noteFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    noteDate: {
        fontSize: 12,
        color: "#6b6a65",
    },
    noteActions: {
        flexDirection: "row",
        gap: 12,
    },
    editTextarea: {
        marginBottom: 10,
    },
    editActionBtn: {
        marginRight: 16,
    },
    editSaveText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#2e7d32",
    },
    editCancelText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b6a65",
    },
    emptyText: {
        textAlign: "center",
        color: "#6b6a65",
        fontSize: 14,
        marginTop: 20,
    },
});

export default NotesScreen;
