import { useCallback, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";

// Web'deki Settings.jsx'te Export/Import tarayıcının dosya indirme/okuma
// API'lerini kullanıyordu (Blob/URL.createObjectURL, <input type="file">) -
// RN'de bunların karşılığı yok, o yüzden expo-file-system (dosya yazma/okuma),
// expo-sharing (native paylaşım sayfasını açıp kaydetmeyi sağlıyor) ve
// expo-document-picker (dosya seçici) kullanıyoruz. Ayrıca web'de Export/Import/
// Clear All aslında backend'e hiç dokunmuyordu (yerel state'i değiştiriyordu,
// yenilemede geri geliyordu) - burada üçü de gerçekten /api/tasks'a gidiyor.
function SettingsScreen() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [tasks, setTasks] = useState([]);
    const [confirming, setConfirming] = useState(false);
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [importing, setImporting] = useState(false);

    const fetchTasks = useCallback(() => {
        apiClient.get("/tasks").then((res) => setTasks(res.data)).catch(() => {});
    }, []);

    useFocusEffect(fetchTasks);

    const handleClearAll = async () => {
        setClearing(true);
        try {
            await Promise.all(tasks.map((t) => apiClient.delete(`/tasks/${t.id}`)));
            setTasks([]);
        } catch (err) {
            console.error("Görevler silinemedi:", err);
        } finally {
            setClearing(false);
            setConfirming(false);
        }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const fileUri = `${FileSystem.cacheDirectory}taskflow-export.json`;
            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(tasks, null, 2));

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, { mimeType: "application/json" });
            } else {
                Alert.alert("Exported", `Saved to ${fileUri}`);
            }
        } catch (err) {
            console.error("Dışa aktarılamadı:", err);
            Alert.alert("Export failed", "Something went wrong while exporting tasks.");
        } finally {
            setExporting(false);
        }
    };

    const handleImport = async () => {
        const result = await DocumentPicker.getDocumentAsync({ type: "application/json" });
        if (result.canceled) return;

        setImporting(true);
        try {
            const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const parsed = JSON.parse(content);

            if (!Array.isArray(parsed)) {
                Alert.alert("Invalid file", "Expected a task list.");
                return;
            }

            // Backend'de görev oluşturma her zaman completed:false ile başlıyor,
            // dışa aktarılan "completed" durumu içe aktarımda korunmuyor.
            await Promise.all(
                parsed.map((t) => apiClient.post("/tasks", { text: t.text, priority: t.priority }))
            );
            fetchTasks();
        } catch (err) {
            console.error("İçe aktarılamadı:", err);
            Alert.alert("Import failed", "Couldn't read the file, please check the JSON format.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Settings</Text>

                <View style={styles.panel}>
                    <View style={styles.panelTitleRow}>
                        <Ionicons name="save-outline" size={15} color={colors.text} />
                        <Text style={styles.panelTitle}>Data</Text>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Export Tasks (JSON)</Text>
                            <Text style={styles.rowDesc}>Save all your tasks as a JSON file.</Text>
                        </View>
                        <Pressable style={styles.btn} onPress={handleExport} disabled={exporting}>
                            {exporting ? (
                                <ActivityIndicator size="small" color={colors.text} />
                            ) : (
                                <>
                                    <Ionicons name="download-outline" size={15} color={colors.text} />
                                    <Text style={styles.btnText}>Export</Text>
                                </>
                            )}
                        </Pressable>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Import Tasks</Text>
                            <Text style={styles.rowDesc}>Add tasks from a previously exported JSON file.</Text>
                        </View>
                        <Pressable style={styles.btn} onPress={handleImport} disabled={importing}>
                            {importing ? (
                                <ActivityIndicator size="small" color={colors.text} />
                            ) : (
                                <>
                                    <Ionicons name="cloud-upload-outline" size={15} color={colors.text} />
                                    <Text style={styles.btnText}>Import</Text>
                                </>
                            )}
                        </Pressable>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.rowText}>
                            <Text style={styles.rowTitle}>Clear All Tasks</Text>
                            <Text style={styles.rowDesc}>
                                Permanently deletes all tasks. Calendar and Statistics will reset too.
                            </Text>
                        </View>

                        {!confirming ? (
                            <Pressable style={styles.dangerBtn} onPress={() => setConfirming(true)}>
                                <Ionicons name="trash-outline" size={15} color="#ffffff" />
                                <Text style={styles.dangerBtnText}>Clear</Text>
                            </Pressable>
                        ) : (
                            <View style={styles.confirmRow}>
                                <Pressable
                                    style={styles.dangerBtn}
                                    onPress={handleClearAll}
                                    disabled={clearing}
                                >
                                    {clearing ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <Text style={styles.dangerBtnText}>Yes, delete</Text>
                                    )}
                                </Pressable>
                                <Pressable style={styles.cancelBtn} onPress={() => setConfirming(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.panel}>
                    <View style={styles.panelTitleRow}>
                        <Ionicons name="information-circle-outline" size={15} color={colors.text} />
                        <Text style={styles.panelTitle}>About</Text>
                    </View>
                    <Text style={styles.aboutText}>
                        <Text style={styles.bold}>TaskFlow</Text> v2.0
                    </Text>
                    <Text style={styles.aboutText}>Created by Hilal Korkmaz</Text>
                    <Text style={styles.aboutMuted}>React Native + Spring Boot + PostgreSQL</Text>
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
        content: {
            padding: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: "600",
            color: colors.text,
            marginBottom: 16,
        },
        panel: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 16,
            marginBottom: 16,
            backgroundColor: colors.surface,
        },
        panelTitleRow: {
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginBottom: 14,
        },
        panelTitle: {
            fontSize: 13,
            fontWeight: "600",
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
        btn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            minWidth: 100,
        },
        btnText: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
        },
        dangerBtn: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: "#c0392b",
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            minWidth: 100,
        },
        dangerBtnText: {
            color: "#ffffff",
            fontSize: 13,
            fontWeight: "600",
        },
        confirmRow: {
            flexDirection: "row",
            gap: 8,
        },
        cancelBtn: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingVertical: 8,
            paddingHorizontal: 12,
            alignItems: "center",
            justifyContent: "center",
        },
        cancelBtnText: {
            fontSize: 13,
            fontWeight: "600",
            color: colors.text,
        },
        aboutText: {
            fontSize: 13,
            color: colors.text,
            marginBottom: 4,
        },
        aboutMuted: {
            fontSize: 12,
            color: colors.textSecondary,
            marginTop: 4,
        },
        bold: {
            fontWeight: "700",
        },
    });
}

export default SettingsScreen;
