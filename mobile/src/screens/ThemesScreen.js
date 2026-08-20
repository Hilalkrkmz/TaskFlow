import { useMemo } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet, useWindowDimensions } from "react-native";
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

const GRID_GAP = 12;
const CONTENT_PADDING = 20;
const CONTENT_MAX_WIDTH = 480;
const COLUMNS = 2;

function ThemesScreen({ onThemeChange }) {
    const { themeKey, setThemeKey, colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { width: rawScreenWidth } = useWindowDimensions();
    // % + gap kombinasyonu dar ekranlarda tutarsız sarılıyordu (bazen 2,
    // bazen 3 sütun) - genişliği doğrudan hesaplayıp sabit 2 sütun garantiliyoruz.
    // content'in kendisi tablette CONTENT_MAX_WIDTH'e sabitlendiği için
    // (aşağıdaki styles.content'e bak) burada da aynı sınırı kullanmalıyız,
    // yoksa kartlar gerçek konteynerden daha büyük hesaplanır.
    const screenWidth = Math.min(rawScreenWidth, CONTENT_MAX_WIDTH);
    const cardWidth =
        (screenWidth - CONTENT_PADDING * 2 - GRID_GAP * (COLUMNS - 1)) / COLUMNS;

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
                                style={[styles.card, { width: cardWidth }, isActive && styles.cardActive]}
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
            padding: CONTENT_PADDING,
            width: "100%",
            maxWidth: CONTENT_MAX_WIDTH,
            alignSelf: "center",
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
            gap: GRID_GAP,
        },
        card: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
            backgroundColor: colors.surface,
        },
        cardActive: {
            borderColor: colors.accent,
            borderWidth: 2,
        },
        swatchRow: {
            flexDirection: "row",
            gap: 6,
            marginBottom: 12,
        },
        swatch: {
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: "#00000014",
        },
        name: {
            fontSize: 14,
            fontWeight: "600",
            color: colors.text,
        },
    });
}

export default ThemesScreen;
