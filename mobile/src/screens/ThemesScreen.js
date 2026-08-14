import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../api/client";
import { useTheme } from "../theme/ThemeContext";
import { THEMES, THEME_KEYS } from "../theme/themes";

const THEME_NAMES = {
    white: "White",
    sakura: "Sakura",
    dark: "Dark",
    ocean: "Ocean",
    forest: "Forest",
    space: "Space",
    desert: "Desert",
    aurora: "Aurora",
    mint: "Mint",
};

function ThemesScreen({ onThemeChange }) {
    const { themeKey, setThemeKey, colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const handleSelectTheme = async (key) => {
        setThemeKey(key);
        onThemeChange?.(key);

        try {
            await apiClient.patch("/users/me/theme", { theme: key });
        } catch (err) {
            console.error("Tema backend'e kaydedilemedi:", err);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>Themes</Text>

                <View style={styles.grid}>
                    {THEME_KEYS.map((key) => {
                        const isActive = themeKey === key;
                        const swatchColors = [THEMES[key].bg, THEMES[key].surfaceMuted, THEMES[key].accent];

                        return (
                            <Pressable
                                key={key}
                                style={[styles.card, isActive && styles.cardActive]}
                                onPress={() => handleSelectTheme(key)}
                            >
                                <View style={styles.swatchRow}>
                                    {swatchColors.map((c, i) => (
                                        <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
                                    ))}
                                </View>
                                <Text style={styles.name}>{THEME_NAMES[key]}</Text>
                            </Pressable>
                        );
                    })}
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
        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 12,
        },
        card: {
            width: "31%",
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            padding: 10,
            alignItems: "center",
            backgroundColor: colors.surface,
        },
        cardActive: {
            borderColor: colors.accent,
            borderWidth: 2,
        },
        swatchRow: {
            flexDirection: "row",
            gap: 4,
            marginBottom: 8,
        },
        swatch: {
            width: 16,
            height: 16,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: "#00000014",
        },
        name: {
            fontSize: 12,
            color: colors.text,
        },
    });
}

export default ThemesScreen;
